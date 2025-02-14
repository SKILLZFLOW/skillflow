import { Api } from '@/core/trpc'
import { Button, Form, Input, Typography, message } from 'antd'

const { Text } = Typography

export default function PremiumUpgradeTab() {
  const [form] = Form.useForm()

  const { data: premiumLink, refetch, isLoading: isLoadingQuery, error: queryError } = Api.premiumLink.findFirst.useQuery(undefined, {
    retry: false,
    onError: (error) => {
      console.error('Failed to fetch premium link:', error)
      message.error('Failed to load premium link data')
    }
  })
  const { mutateAsync: updateLink, isLoading: isUpdating } =
    Api.premiumLink.update.useMutation()
  const { mutateAsync: createLink, isLoading: isCreating } =
    Api.premiumLink.create.useMutation()

  const handleSubmit = async (values: { url: string }) => {
    if (!values.url.trim()) {
      return message.error('URL cannot be empty - please provide a valid payment link')
    }

    try {
      // Validate URL format
      if (!values.url.startsWith('http://') && !values.url.startsWith('https://')) {
        message.error('URL must start with http:// or https://');
        return;
      }
      try {
        new URL(values.url.trim())
      } catch (e) {
        return message.error('Invalid URL format - must be a complete URL starting with http:// or https://')
      }

      let response;
      if (premiumLink?.id) {
        response = await updateLink({
          where: { id: premiumLink.id },
          data: { url: values.url.trim() }
        })
      } else {
        response = await createLink({
          data: { url: values.url.trim() }
        })
      }
      
      console.log('Premium link successfully saved:', response)
      console.log('Premium link URL:', response.url)
      message.success(`Premium link saved: ${response.url}`)
      form.resetFields()
      form.setFieldsValue({ url: response.url })
      refetch()
    } catch (error) {
      console.error('Update premium link error:', {
        error,
        values,
        premiumLinkId: premiumLink?.id
      })
      message.error(error.message || 'Failed to update premium link')
    }
  }

  return (
    <div className="p-4">
      {isLoadingQuery ? (
        <div className="mb-4">
          <Text>Loading premium link data...</Text>
        </div>
      ) : queryError ? (
        <div className="mb-4">
          <Text type="danger">Error loading premium link data. Please try again.</Text>
        </div>
      ) : (
        <div className="mb-4">
          {premiumLink?.url && (
            <Text>
              Current Link: <Text strong>{premiumLink.url}</Text>
            </Text>
          )}
        </div>
      )}

      <Form
        form={form}
        onFinish={handleSubmit}
        layout="vertical"
        initialValues={{ url: premiumLink?.url }}
        disabled={isLoadingQuery}
      >
        <Form.Item
          name="url"
          label="Payment Link URL"
          rules={[
            { required: true, message: 'Payment link URL is required' },
            { type: 'url', message: 'Please enter a valid URL starting with http:// or https://' },
            { 
              validator: async (_, value) => {
                if (!value?.trim()) return
                try {
                  new URL(value)
                } catch (e) {
                  throw new Error('Invalid URL format')
                }
              }
            }
          ]}
          validateTrigger={['onChange', 'onBlur']}
        >
          <Input placeholder="https://example.com/payment" />
        </Form.Item>

        <Form.Item>
          <Button 
            type="primary" 
            htmlType="submit" 
            loading={isUpdating || isCreating}
            disabled={isUpdating || isCreating}
          >
            {isUpdating || isCreating ? 'Saving...' : 'Save Link'}
          </Button>
        </Form.Item>
      </Form>
    </div>
  )
}
