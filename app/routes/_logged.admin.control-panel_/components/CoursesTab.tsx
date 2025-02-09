import { Button, Table, message, Select, Typography, Modal, Form, Input, Switch } from 'antd'
import { Api } from '@/core/trpc'
import { useState } from 'react'
import { PlusOutlined, EditOutlined, DeleteOutlined } from '@ant-design/icons'

const { Title } = Typography

export default function CoursesTab() {
  const { data: courses, isLoading, refetch } = Api.course.findMany.useQuery()
  const { mutateAsync: createCourse } = Api.course.create.useMutation()
  const { mutateAsync: updateCourse } = Api.course.update.useMutation()
  const { mutateAsync: deleteCourse } = Api.course.delete.useMutation()

  const [isModalVisible, setIsModalVisible] = useState(false)
  const [editingCourse, setEditingCourse] = useState<any>(null)
  const [form] = Form.useForm()

  const handleCreate = () => {
    setEditingCourse(null)
    form.resetFields()
    setIsModalVisible(true)
  }

  const handleEdit = (record: any) => {
    setEditingCourse(record)
    form.setFieldsValue(record)
    setIsModalVisible(true)
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteCourse({ where: { id } })
      message.success('Course deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete course')
    }
  }

  const handleModalOk = async () => {
    try {
      const values = await form.validateFields()
      if (editingCourse) {
        await updateCourse({
          where: { id: editingCourse.id },
          data: values
        })
        message.success('Course updated successfully')
      } else {
        await createCourse({ data: values })
        message.success('Course created successfully')
      }
      setIsModalVisible(false)
      refetch()
    } catch (error) {
      message.error('Failed to save course')
    }
  }

  const columns = [
    {
      title: 'Title',
      dataIndex: 'title',
      key: 'title',
    },
    {
      title: 'Description',
      dataIndex: 'description',
      key: 'description',
    },
    {
      title: 'Premium',
      dataIndex: 'isPremium',
      key: 'isPremium',
      render: (isPremium: boolean) => (isPremium ? 'Yes' : 'No'),
    },
    {
      title: 'Price',
      dataIndex: 'price',
      key: 'price',
      render: (price: string) => `$${price}`,
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            icon={<EditOutlined />}
            onClick={() => handleEdit(record)}
          >
            Edit
          </Button>
          <Button
            danger
            icon={<DeleteOutlined />}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>Courses Management</Title>
        <Button
          type="primary"
          icon={<PlusOutlined />}
          onClick={handleCreate}
        >
          Add Course
        </Button>
      </div>

      <Table
        columns={columns}
        dataSource={courses}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />

      <Modal
        title={editingCourse ? 'Edit Course' : 'Create Course'}
        open={isModalVisible}
        onOk={handleModalOk}
        onCancel={() => setIsModalVisible(false)}
      >
        <Form
          form={form}
          layout="vertical"
        >
          <Form.Item
            name="title"
            label="Title"
            rules={[{ required: true, message: 'Please input course title!' }]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true, message: 'Please input course description!' }]}
          >
            <Input.TextArea />
          </Form.Item>
          <Form.Item
            name="isPremium"
            label="Premium"
            valuePropName="checked"
          >
            <Switch />
          </Form.Item>
          <Form.Item
            name="price"
            label="Price"
            rules={[{ required: true, message: 'Please input course price!' }]}
          >
            <Input prefix="$" />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  )
}
