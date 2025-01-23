import { useUserContext } from '@/core/context'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Row,
  Space,
  Typography,
} from 'antd'
const { Title, Text } = Typography

export default function SettingsPage() {
  const { user } = useUserContext()
  const [form] = Form.useForm()

  const { data: userData, refetch } = Api.user.findFirst.useQuery({
    where: { id: user?.id },
    include: { socialAccounts: true },
  })

  const { mutateAsync: updateUser } = Api.user.update.useMutation()
  const { mutateAsync: createSocialAccount } =
    Api.socialAccount.create.useMutation()
  const { mutateAsync: deleteSocialAccount } =
    Api.socialAccount.delete.useMutation()

  const { mutateAsync: logout } = Api.authentication.logout.useMutation({
    onSuccess: data => {
      if (data.redirect) {
        window.location.href = data.redirect
      }
    },
  })

  const handleClickLogout = async () => {
    try {
      await logout()
    } catch (error) {
      message.error('Failed to logout')
    }
  }

  const handleProfileUpdate = async (values: any) => {
    try {
      if (user?.id) {
        await updateUser({
          where: { id: user.id },
          data: {
            name: values.name,
            email: values.email,
          },
        })
        message.success('Profile updated successfully')
        refetch()
      }
    } catch (error) {
      message.error('Failed to update profile')
    }
  }

  const handleConnectSocial = async (platform: string) => {
    try {
      if (user?.id) {
        await createSocialAccount({
          data: {
            platform,
            status: 'CONNECTED',
            userId: user.id,
          },
        })
        message.success(`${platform} account connected`)
        refetch()
      }
    } catch (error) {
      message.error(`Failed to connect ${platform} account`)
    }
  }

  const handleDisconnectSocial = async (accountId: string) => {
    try {
      await deleteSocialAccount({
        where: { id: accountId },
      })
      message.success('Social account disconnected')
      refetch()
    } catch (error) {
      message.error('Failed to disconnect account')
    }
  }

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Title level={2}>
          <i className="las la-cog"></i> Settings
        </Title>
        <Text>Manage your account settings and preferences</Text>

        <Row gutter={[24, 24]} style={{ marginTop: 24 }}>
          <Col xs={24}>
            <Card
              title={
                <>
                  <i className="las la-user"></i> Profile Information
                </>
              }
            >
              <Form
                form={form}
                layout="vertical"
                initialValues={{
                  name: userData?.name,
                  email: userData?.email,
                }}
                onFinish={handleProfileUpdate}
              >
                <Form.Item label="Name" name="name">
                  <Input placeholder="Enter your name" />
                </Form.Item>
                <Form.Item label="Email" name="email">
                  <Input placeholder="Enter your email" />
                </Form.Item>
                <Space>
                  <Button type="primary" htmlType="submit">
                    <i className="las la-save"></i> Save Changes
                  </Button>
                  <Button danger onClick={handleClickLogout}>
                    <i className="las la-sign-out-alt"></i> Logout
                  </Button>
                </Space>
              </Form>
            </Card>
          </Col>

          <Col xs={24}>
            <Card
              title={
                <>
                  <i className="las la-share-alt"></i> Connected Accounts
                </>
              }
              style={{ marginTop: 24 }}
            >
              <div
                style={{ display: 'flex', flexDirection: 'column', gap: 16 }}
              >
                {['TikTok', 'Facebook'].map(platform => {
                  const isConnected = userData?.socialAccounts?.some(
                    account => account.platform === platform,
                  )
                  const account = userData?.socialAccounts?.find(
                    account => account.platform === platform,
                  )

                  return (
                    <div
                      key={platform}
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <Text>
                        <i className={`lab la-${platform.toLowerCase()}`}></i>{' '}
                        {platform}
                      </Text>
                      {isConnected && account ? (
                        <Button
                          danger
                          onClick={() => handleDisconnectSocial(account.id)}
                        >
                          Disconnect
                        </Button>
                      ) : (
                        <Button
                          type="primary"
                          onClick={() => handleConnectSocial(platform)}
                        >
                          Connect
                        </Button>
                      )}
                    </div>
                  )
                })}
              </div>
            </Card>
          </Col>
        </Row>
      </div>
    </PageLayout>
  )
}
