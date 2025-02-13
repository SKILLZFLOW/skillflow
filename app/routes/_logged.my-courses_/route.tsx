import { useUserContext } from '@/core/context'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'
import { useNavigate } from '@remix-run/react'
import { Button, Card, Col, Row, Typography } from 'antd'

const { Title, Text } = Typography

export default function MyCoursesPage() {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { data: enrolledCourses, isLoading } = Api.userCourse.findMany.useQuery(
    { where: { userId: user?.id }, include: { course: true } },
  )
  const { data: subscription } = Api.subscription.findFirst.useQuery({
    where: { userId: user?.id },
  })

  const handleContinue = (courseId: string) => {
    navigate(`/courses/${courseId}`)
  }

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '20px' }}>
        <div style={{ textAlign: 'center', marginBottom: '40px' }}>
          <Title level={2}>
            <i className="las la-graduation-cap"></i> My Courses
          </Title>
          <Text>Continue learning from where you left off</Text>
        </div>

        <Row gutter={[24, 24]}>
          {enrolledCourses?.map(({ course }) => (
            <Col xs={24} sm={12} md={8} lg={8} key={course.id}>
              <Card
                hoverable
                cover={
                  <img
                    alt={course.title}
                    src={course.previewUrl || '/images/course-fallback.jpg'}
                    style={{ height: 200, objectFit: 'cover' }}
                  />
                }
              >
                <Card.Meta
                  title={course.title}
                  description={course.description}
                />
                <Button
                  type="primary"
                  block
                  style={{ marginTop: '16px' }}
                  onClick={() => handleContinue(course.id)}
                >
                  Continue
                </Button>
              </Card>
            </Col>
          ))}

          {enrolledCourses?.length === 0 && (
            <Col span={24} style={{ textAlign: 'center' }}>
              <Text>You haven't enrolled in any courses yet.</Text>
            </Col>
          )}
        </Row>
      </div>
    </PageLayout>
  )
}
