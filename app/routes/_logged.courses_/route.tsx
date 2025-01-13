import { Typography, Card, Row, Col, Button, Spin, message } from 'antd'
const { Title, Text } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function CoursesPage() {
  const navigate = useNavigate()
  const { user, isLoggedIn } = useUserContext()
  const { data: courses, isLoading } = Api.course.findMany.useQuery({})
  const { data: subscription } = Api.subscription.findFirst.useQuery({
    where: { userId: user?.id },
  })

  const isPremiumUser = subscription?.status === 'active'

  const handleUpgrade = () => {
    navigate('/upgrade')
  }

  const handleWatchCourse = async (course: any) => {
    if (!isLoggedIn) {
      message.warning('Please login to watch courses')
      return
    }

    if (course.isPremium && !isPremiumUser) {
      message.info('This is a premium course. Please upgrade to watch.')
      return
    }

    // Open video in new tab
    window.open(isPremiumUser ? course.contentUrl : course.previewUrl, '_blank')
  }

  if (isLoading) {
    return (
      <PageLayout layout="full-width">
        <div style={{ textAlign: 'center', padding: '50px' }}>
          <Spin size="large" />
        </div>
      </PageLayout>
    )
  }

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2}>
            <i className="las la-play-circle"></i> Course Library
          </Title>
          <Text>
            Explore our collection of premium courses. Upgrade your account to
            access all content.
          </Text>
        </div>

        {!isPremiumUser && (
          <Card
            style={{
              marginBottom: '24px',
              textAlign: 'center',
              background: '#f0f7ff',
            }}
          >
            <Title level={4}>
              <i className="las la-crown"></i> Unlock Premium Content
            </Title>
            <Text>
              Get unlimited access to all our premium courses and exclusive
              content.
            </Text>
            <div style={{ marginTop: '16px' }}>
              <Button type="primary" size="large" onClick={handleUpgrade}>
                Upgrade Now
              </Button>
            </div>
          </Card>
        )}

        <Row gutter={[24, 24]}>
          {courses?.map(course => (
            <Col xs={24} sm={12} md={8} lg={8} key={course.id}>
              <Card
                hoverable
                cover={
                  <div
                    style={{
                      height: '200px',
                      background: '#f0f0f0',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <i
                      className="las la-play-circle"
                      style={{ fontSize: '48px', color: '#1890ff' }}
                    ></i>
                  </div>
                }
                actions={[
                  <Button
                    key="watch"
                    type="primary"
                    block
                    onClick={() => handleWatchCourse(course)}
                  >
                    {course.isPremium && !isPremiumUser
                      ? 'Watch Preview'
                      : 'Watch Now'}
                  </Button>,
                ]}
              >
                <Card.Meta
                  title={
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px',
                      }}
                    >
                      {course.title}
                      {course.isPremium && (
                        <i
                          className="las la-crown"
                          style={{ color: '#ffd700', fontSize: '18px' }}
                        ></i>
                      )}
                    </div>
                  }
                  description={
                    <>
                      <Text>{course.description}</Text>
                      {course.isPremium && !isPremiumUser && (
                        <div style={{ marginTop: '8px' }}>
                          <Text type="secondary">
                            <i className="las la-lock"></i> Premium content
                          </Text>
                        </div>
                      )}
                    </>
                  }
                />
              </Card>
            </Col>
          ))}
        </Row>
      </div>
    </PageLayout>
  )
}
