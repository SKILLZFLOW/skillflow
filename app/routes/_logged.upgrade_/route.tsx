import { Typography, Card, Button, Row, Col, message } from 'antd'
const { Title, Text, Paragraph } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function UpgradePage() {
  const navigate = useNavigate()
  const { user } = useUserContext()
  const { data: products, isLoading } = Api.billing.findManyProducts.useQuery(
    {},
  )
  const { mutateAsync: createPaymentLink } =
    Api.billing.createPaymentLink.useMutation()

  const handleUpgrade = async (productId: string) => {
    try {
      const paymentLink = await createPaymentLink({ productId })
      if (paymentLink) {
        window.location.href = paymentLink
      }
    } catch (error) {
      message.error('Failed to process payment. Please try again.')
    }
  }

  const premiumFeatures = [
    {
      icon: 'crown',
      title: 'Premium Courses',
      description: 'Access to all premium courses and content',
    },
    {
      icon: 'rocket',
      title: 'Priority Support',
      description: '24/7 dedicated customer support',
    },
    {
      icon: 'download',
      title: 'Offline Access',
      description: 'Download courses for offline viewing',
    },
    {
      icon: 'certificate',
      title: 'Certificates',
      description: 'Earn certificates upon course completion',
    },
  ]

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Title level={2} style={{ textAlign: 'center' }}>
          <i className="las la-gem" style={{ marginRight: 8 }}></i>
          Upgrade to Premium
        </Title>
        <Paragraph style={{ textAlign: 'center', marginBottom: 40 }}>
          Unlock all premium features and take your learning experience to the
          next level
        </Paragraph>

        <Row gutter={[24, 24]} style={{ marginBottom: 48 }}>
          {premiumFeatures.map((feature, index) => (
            <Col xs={24} sm={12} md={6} key={index}>
              <Card style={{ height: '100%', textAlign: 'center' }}>
                <i
                  className={`las la-${feature.icon}`}
                  style={{ fontSize: 32, color: '#1890ff', marginBottom: 16 }}
                ></i>
                <Title level={4}>{feature.title}</Title>
                <Text type="secondary">{feature.description}</Text>
              </Card>
            </Col>
          ))}
        </Row>

        <Row gutter={[24, 24]} justify="center">
          {isLoading ? (
            <Col span={24} style={{ textAlign: 'center' }}>
              <Text>Loading available plans...</Text>
            </Col>
          ) : (
            products?.map((product, index) => (
              <Col xs={24} sm={12} md={8} key={index}>
                <Card
                  title={
                    <Title level={3} style={{ textAlign: 'center', margin: 0 }}>
                      {product.name}
                    </Title>
                  }
                  style={{ height: '100%' }}
                >
                  <div style={{ textAlign: 'center', marginBottom: 24 }}>
                    <Title level={2} style={{ margin: 0 }}>
                      ${product.price.toString()}
                    </Title>
                    <Text type="secondary">{product.interval}</Text>
                  </div>
                  <Paragraph style={{ minHeight: 80 }}>
                    {product.description}
                  </Paragraph>
                  <Button
                    type="primary"
                    size="large"
                    block
                    onClick={() => handleUpgrade(product.id)}
                    icon={<i className="las la-arrow-right"></i>}
                  >
                    Upgrade Now
                  </Button>
                </Card>
              </Col>
            ))
          )}
        </Row>

        <div style={{ textAlign: 'center', marginTop: 48 }}>
          <Text type="secondary">
            <i className="las la-lock" style={{ marginRight: 8 }}></i>
            Secure payment powered by Fapshi
          </Text>
        </div>
      </div>
    </PageLayout>
  )
}
