import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'
import { useUploadPublic } from '@/plugins/upload/client'
import { useParams } from '@remix-run/react'
import { useEffect } from 'react'
import {
  Button,
  Form,
  Input,
  InputNumber,
  List,
  message,
  Modal,
  Space,
  Spin,
  Table,
  Typography,
  Upload,
} from 'antd'
import { useState } from 'react'

const { Title } = Typography

export default function CourseEditPage() {
  const { courseId } = useParams()
  const [form] = Form.useForm()
  const [sectionForm] = Form.useForm()
  const [videoForm] = Form.useForm()
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>()
  const [editingVideo, setEditingVideo] = useState<Video | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [sectionToDelete, setSectionToDelete] = useState<string | null>(null)
  const [showFirstConfirm, setShowFirstConfirm] = useState(false)
  const [showSecondConfirm, setShowSecondConfirm] = useState(false)
  const [videoToDelete, setVideoToDelete] = useState<string | null>(null)

  useEffect(() => {
    const loadTikTokScript = () => {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      return script
    }
    const script = loadTikTokScript()
    return () => {
      if (script) document.body.removeChild(script)
    }
  }, [])

  const isYoutubeUrl = (url: string) => {
    return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')
  }

  const isTiktokUrl = (url: string) => {
    return url.includes('tiktok.com')
  }

  const { mutateAsync: upload } = useUploadPublic()
  const {
    data: course,
    isLoading,
    refetch,
  } = Api.course.findUnique.useQuery({
    where: { id: courseId },
    include: { sections: { include: { videos: true } } },
  })
  const { mutateAsync: updateCourse } = Api.course.update.useMutation()
  const { mutateAsync: createSection } = Api.section.create.useMutation()
  const { mutateAsync: createVideo } = Api.video.create.useMutation()
  const { mutateAsync: updateVideo } = Api.video.update.useMutation()
  const { mutateAsync: deleteVideo } = Api.video.delete.useMutation()
  const { mutateAsync: deleteSection } = Api.section.delete.useMutation()

  const handleCourseSubmit = async (values: any) => {
    try {
      await updateCourse({
        where: { id: courseId },
        data: values,
      })
      message.success('Course updated successfully')
      refetch()
    } catch (error) {
      message.error('Failed to update course')
    }
  }

  const handleAddSection = async (values: any) => {
    try {
      await createSection({
        data: {
          ...values,
          courseId,
        },
      })
      message.success('Section added successfully')
      sectionForm.resetFields()
      refetch()
    } catch (error) {
      message.error('Failed to add section')
    }
  }

  const handleEditVideo = (video: any) => {
    setEditingVideo(video);
    videoForm.setFieldsValue(video);
    setIsVideoModalVisible(true);
  };

  const handleDeleteVideo = async (videoId: string) => {
    try {
      await deleteVideo({ where: { id: videoId } });
      message.success('Video deleted successfully');
      refetch();
    } catch (error) {
      console.error('Delete video error:', error);
      message.error(`Failed to delete video: ${error.message}`);
    }
  };

  const handleDeleteSection = async (sectionId: string) => {
    try {
      await deleteSection({ where: { id: sectionId } })
      message.success('Section deleted successfully')
      refetch()
    } catch (error) {
      console.error('Delete section error:', error)
      message.error(`Failed to delete section: ${error.message}`)
    } finally {
      setSectionToDelete(null)
      setShowFirstConfirm(false)
      setShowSecondConfirm(false)
    }
  }

  const handleAddVideo = async (values: Prisma.VideoCreateInput) => {
    setIsSubmitting(true);
    try {
      const videoData = {
        title: values.title,
        description: values.description,
        embedLink: values.embedLink,
        order: values.order,
        sectionId: selectedSectionId!
      };
      
      if (editingVideo) {
        await updateVideo({
          where: { id: editingVideo.id },
          data: videoData
        });
        message.success('Video updated successfully');
      } else {
        await createVideo({
          data: videoData,
        });
        message.success('Video added successfully');
      }
      refetch();
    } catch (error) {
      console.error('Video save error:', error);
      message.error(`Failed to save video: ${error.message}`);
    } finally {
      setIsVideoModalVisible(false);
      setEditingVideo(null);
      videoForm.resetFields();
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <PageLayout>
        <div className="flex justify-center items-center h-full">
          <Spin size="large" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto p-6">
        <Title level={2}>Edit Course</Title>

        <Form
          form={form}
          layout="vertical"
          initialValues={course}
          onFinish={handleCourseSubmit}
          className="mb-8"
        >
          <Form.Item name="title" label="Title" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Form.Item
            name="description"
            label="Description"
            rules={[{ required: true }]}
          >
            <Input.TextArea />
          </Form.Item>

          <Form.Item name="price" label="Price" rules={[{ required: true }]}>
            <Input />
          </Form.Item>

          <Button type="primary" htmlType="submit">
            Update Course
          </Button>
        </Form>

        <div className="mb-8">
          <Title level={3}>Sections</Title>
          <Form
            form={sectionForm}
            layout="vertical"
            onFinish={handleAddSection}
          >
            <Form.Item
              name="title"
              label="Section Title"
              rules={[{ required: true }]}
            >
              <Input />
            </Form.Item>

            <Form.Item name="order" label="Order" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>

            <Button type="primary" htmlType="submit">
              Add Section
            </Button>
          </Form>
        </div>

        <List
          dataSource={course?.sections}
          renderItem={(section: any) => (
            <List.Item>
              <div className="w-full">
                <div className="flex justify-between items-center mb-4">
                  <Title level={4}>{section.title}</Title>
                  <Space>
                    <Button
                      type="primary"
                      onClick={() => {
                        setSelectedSectionId(section.id)
                        setIsVideoModalVisible(true)
                      }}
                    >
                      Add Video
                    </Button>
                    <Button danger onClick={() => {
                      setSectionToDelete(section.id)
                      setShowFirstConfirm(true)
                    }}>Delete Section</Button>
                  </Space>
                </div>

                <Table 
                  dataSource={section.videos}
                  columns={[
                    { title: 'Title', dataIndex: 'title' },
                    { title: 'Source', dataIndex: 'embedLink' },
                    { title: 'Order', dataIndex: 'order' },
                    { 
                      title: 'Actions',
                      render: (_, video) => (
                        <Space>
                          <Button onClick={() => handleEditVideo(video)}>Edit</Button>
                          <Button danger onClick={() => setVideoToDelete(video.id)}>Delete</Button>
                        </Space>
                      )
                    }
                  ]}
                  pagination={false}
                />
              </div>
            </List.Item>
          )}
        />

        <Modal
          title={editingVideo ? 'Edit Video' : 'Add Video'}
          open={isVideoModalVisible}
          onCancel={() => {
            setIsVideoModalVisible(false);
            setEditingVideo(null);
            videoForm.resetFields();
          }}
          footer={null}
        >
          <Form form={videoForm} layout="vertical" onFinish={handleAddVideo}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true },
                { max: 100, message: 'Title cannot exceed 100 characters' },
              ]}
            >
              <Input />
            </Form.Item>

            <Form.Item
              name="description"
              label="Description"
              rules={[
                { required: true },
                {
                  max: 500,
                  message: 'Description cannot exceed 500 characters',
                },
              ]}
            >
              <Input.TextArea />
            </Form.Item>

            <Form.Item
              name="embedLink"
              label="Embed Link"
              rules={[
                { required: true },
                {
                  pattern: /^(https?:\/\/)?(www\.)?(youtube\.com\/watch\?v=[\w-]+|youtu\.be\/[\w-]+(\?si=[\w-]+)?|tiktok\.com\/@[\w-]+\/video\/[\d]+)$/,
                  message: 'Please enter a valid YouTube or TikTok URL',
                },
              ]}
            >
              <Input />
            </Form.Item>


            <Form.Item name="order" label="Order" rules={[{ required: true }]}>
              <InputNumber min={1} />
            </Form.Item>


            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {editingVideo ? 'Update' : 'Add'} Video
            </Button>
          </Form>
        </Modal>

        <Modal
          title="Delete Section"
          open={showFirstConfirm}
          onOk={() => {
            setShowFirstConfirm(false)
            setShowSecondConfirm(true)
          }}
          onCancel={() => {
            setSectionToDelete(null)
            setShowFirstConfirm(false)
          }}
        >
          <p>Are you sure you want to delete this section? All videos will be deleted.</p>
        </Modal>

        <Modal
          title="Final Confirmation"
          open={showSecondConfirm}
          onOk={() => handleDeleteSection(sectionToDelete!)}
          onCancel={() => {
            setSectionToDelete(null)
            setShowSecondConfirm(false)
          }}
        >
          <p>This action cannot be undone. Are you absolutely sure?</p>
        </Modal>

        <Modal
          title="Delete Video"
          open={!!videoToDelete}
          onOk={() => {
            handleDeleteVideo(videoToDelete!)
            setVideoToDelete(null)
          }}
          onCancel={() => setVideoToDelete(null)}
        >
          <p>Are you sure you want to delete this video? This action cannot be undone.</p>
        </Modal>
      </div>
    </PageLayout>
  )
}
