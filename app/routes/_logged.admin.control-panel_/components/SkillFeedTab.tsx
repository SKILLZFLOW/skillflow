import { Table, Typography, Form, Input, Button, message } from 'antd'
import { Api } from '@/core/trpc'
import { useState } from 'react'

interface VideoFormValues {
  title: string
  description: string 
  link: string
}

const { Title } = Typography

export default function SkillFeedTab() {
  const [form] = Form.useForm()
  
  const { data: videos, isLoading: isLoadingVideos, refetch } = Api.skillFeedVideo.findMany.useQuery()
  const { mutateAsync: createVideo, isLoading: isCreating } = Api.skillFeedVideo.create.useMutation()
  const handleSubmit = async (values: VideoFormValues) => {
    try {
      console.log('Creating video with data:', values)
      await createVideo({ data: values })
      message.success('Video created successfully')
      form.resetFields()
      refetch()
    } catch (error) {
      console.error('Create video error:', error)
      message.error(`Failed to create video: ${error.message}`)
    }
  }

  const columns: Array<{
    title: string;
    dataIndex: string;
    key: string;
  }> = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title'
    },
    {
      title: 'Description', 
      dataIndex: 'description',
      key: 'description'
    },
    {
      title: 'Link',
      dataIndex: 'link',
      key: 'link'
    }
  ]

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>SkillFeed Videos</Title>
      </div>

      <div className="mb-8">
        <Form
          form={form}
          onFinish={handleSubmit}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input video title!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input video description!' }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item
            name="link"
            label="Link"
            rules={[{ required: true, message: 'Please input video link!' }]}
          >
            <Input />
          </Form.Item>

          <Form.Item>
            <Button type="primary" htmlType="submit" loading={isCreating}>
              Add Video
            </Button>
          </Form.Item>
        </Form>
      </div>

      <Table
        columns={columns}
        dataSource={videos}
        rowKey="id"
        loading={isLoadingVideos}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
