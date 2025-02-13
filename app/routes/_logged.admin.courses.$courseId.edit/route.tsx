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
  Spin,
  Typography,
  Upload,
} from 'antd'
import { RcFile } from 'antd/es/upload'
import { useState } from 'react'

const { Title } = Typography

export default function CourseEditPage() {
  const { courseId } = useParams()
  const [form] = Form.useForm()
  const [sectionForm] = Form.useForm()
  const [videoForm] = Form.useForm()
  const [isVideoModalVisible, setIsVideoModalVisible] = useState(false)
  const [selectedSectionId, setSelectedSectionId] = useState<string>()

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

  const handleAddVideo = async (values: any) => {
    try {
      let documentUrl = ''
      if (values.file) {
        try {
          const result = await upload({ file: values.file })
          documentUrl = result.url
        } catch (uploadError) {
          console.error('Upload error:', uploadError)
          message.error(
            `Failed to upload PDF: ${
              uploadError.message || 'Unknown upload error occurred'
            }`,
          )
          return
        }
      }

      const { file, ...formData } = values
      await createVideo({
        data: {
          ...formData,
          documentUrl,
          documentType: 'pdf',
          sectionId: selectedSectionId,
        },
      })
      message.success('Video added successfully')
      setIsVideoModalVisible(false)
      videoForm.resetFields()
      refetch()
    } catch (error) {
      console.error('Video creation error:', error)
      message.error(
        `Failed to add video: ${error.message || 'Unknown error occurred'}`,
      )
    }
  }

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
                  <Button
                    type="primary"
                    onClick={() => {
                      setSelectedSectionId(section.id)
                      setIsVideoModalVisible(true)
                    }}
                  >
                    Add Video
                  </Button>
                </div>

                <List
                  dataSource={section.videos}
                  renderItem={(video: any) => (
                    <List.Item>
                      <div>
                        <div>{video.title}</div>
                        <div className="text-gray-500">{video.description}</div>
                        <div className="w-full h-[90vh] flex flex-col justify-center video-container">
                          {isYoutubeUrl(video.embedLink) ? (
                            <iframe
                              src={video.embedLink.replace(
                                /(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                                'youtube.com/embed/$2'
                              )}
                              className="w-full h-[90vh] mx-auto rounded-lg"
                              width="100%"
                              height="100%"
                              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                              allowFullScreen
                            />
                          ) : isTiktokUrl(video.embedLink) ? (
                            <blockquote
                              className="tiktok-embed mx-auto"
                              cite={video.embedLink}
                              data-video-id={video.embedLink.split('/').pop()}
                              style={{ width: '325px', height: '90vh' }}
                            >
                              <section></section>
                            </blockquote>
                          ) : (
                            <div className="text-center text-red-500">
                              Unsupported video format
                            </div>
                          )}
                        </div>
                      </div>
                    </List.Item>
                  )}
                />
              </div>
            </List.Item>
          )}
        />

        <Modal
          title="Add Video"
          open={isVideoModalVisible}
          onCancel={() => setIsVideoModalVisible(false)}
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

            <Button type="primary" htmlType="submit">
              Add Video
            </Button>
          </Form>
        </Modal>
      </div>
    </PageLayout>
  )
}
            <Form.Item name="file" label="PDF File">
              <Upload
                beforeUpload={(file: RcFile) => {
                  if (file.type !== 'application/pdf') {
                    message.error('Only PDF files are allowed')
                    return false
                  }
                  videoForm.setFieldValue('file', file)
                  return false
                }}
                maxCount={1}
                accept=".pdf"
              >
                <Button>Select Video File</Button>
              </Upload>
            </Form.Item>
