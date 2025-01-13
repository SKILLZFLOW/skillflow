import { Button, Typography, Space, Row, Col, Card, Switch } from 'antd'
import { useState } from 'react'
const { Title, Text, Paragraph } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function WelcomePage() {
  const navigate = useNavigate()
  const { isLoggedIn } = useUserContext()
  const [isDarkMode, setIsDarkMode] = useState(false)

  const handleModeChange = (checked: boolean) => {
    setIsDarkMode(checked)
    // Apply dark mode class to body
    document.body.classList.toggle('dark-mode', checked)
  }

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '2rem' }}>
        {/* Header Section */}
        <Row
          justify="space-between"
          align="middle"
          style={{ marginBottom: '2rem' }}
        >
          <Col>
            <Title level={1}>Welcome to Our Platform</Title>
          </Col>
          <Col>
            <Space>
              <Switch
                checkedChildren={<i className="las la-moon" />}
                unCheckedChildren={<i className="las la-sun" />}
                checked={isDarkMode}
                onChange={handleModeChange}
              />
              {!isLoggedIn && (
                <>
                  <Button type="default" onClick={() => navigate('/login')}>
                    <i className="las la-sign-in-alt" /> Login
                  </Button>
                  <Button type="primary" onClick={() => navigate('/signup')}>
                    <i className="las la-user-plus" /> Sign Up
                  </Button>
                </>
              )}
            </Space>
          </Col>
        </Row>

        {/* Hero Section */}
        <Row gutter={[24, 24]} style={{ marginBottom: '4rem' }}>
          <Col xs={24} md={12}>
            <Title level={2}>Transform Your Learning Journey</Title>
            <Paragraph style={{ fontSize: '1.2rem' }}>
              Join our platform to access premium courses, earn while you learn,
              and connect with a global community of learners.
            </Paragraph>
            {!isLoggedIn && (
              <Button
                type="primary"
                size="large"
                onClick={() => navigate('/signup')}
              >
                Get Started Now <i className="las la-arrow-right" />
              </Button>
            )}
          </Col>
          <Col xs={24} md={12}>
            <div style={{ textAlign: 'center' }}>
              <i
                className="las la-graduation-cap"
                style={{ fontSize: '150px', color: '#1890ff' }}
              />
            </div>
          </Col>
        </Row>

        {/* Benefits Section */}
        <Title level={2} style={{ textAlign: 'center', marginBottom: '2rem' }}>
          Platform Benefits
        </Title>
        <Row gutter={[24, 24]}>
          <Col xs={24} md={8}>
            <Card>
              <i
                className="las la-book"
                style={{ fontSize: '40px', color: '#1890ff' }}
              />
              <Title level={4}>Premium Courses</Title>
              <Text>Access high-quality courses from industry experts</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <i
                className="las la-wallet"
                style={{ fontSize: '40px', color: '#52c41a' }}
              />
              <Title level={4}>Earn Rewards</Title>
              <Text>Get rewarded for your learning achievements</Text>
            </Card>
          </Col>
          <Col xs={24} md={8}>
            <Card>
              <i
                className="las la-users"
                style={{ fontSize: '40px', color: '#722ed1' }}
              />
              <Title level={4}>Community</Title>
              <Text>Connect with learners from around the world</Text>
            </Card>
          </Col>
        </Row>

        {/* Call to Action */}
        <Row justify="center" style={{ marginTop: '4rem' }}>
          <Col>
            <Card style={{ textAlign: 'center', background: '#f0f2f5' }}>
              <Title level={3}>Ready to Start Your Journey?</Title>
              <Paragraph>
                Join thousands of successful learners today!
              </Paragraph>
              {!isLoggedIn && (
                <Button
                  type="primary"
                  size="large"
                  onClick={() => navigate('/signup')}
                >
                  Sign Up Now <i className="las la-rocket" />
                </Button>
              )}
            </Card>
          </Col>
        </Row>
      </div>
    </PageLayout>
  )
}
