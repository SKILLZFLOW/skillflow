import {
  Typography,
  Card,
  Statistic,
  Row,
  Col,
  Button,
  message,
  Table,
} from 'antd'
import { useState } from 'react'
const { Title, Text } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function AffiliatePage() {
  const { user } = useUserContext()
  const [copied, setCopied] = useState(false)

  // Fetch referrals where user is referrer
  const { data: referrals } = Api.referral.findMany.useQuery({
    where: { referrerId: user?.id },
    include: {
      referred: true,
      transactions: true,
    },
  })

  // Calculate statistics
  const totalReferrals = referrals?.length || 0
  const totalEarnings =
    referrals?.reduce((sum, ref) => sum + Number(ref.commission || 0), 0) || 0

  const affiliateLink = `${window.location.origin}/signup?ref=${user?.id}`

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(affiliateLink)
      setCopied(true)
      message.success('Affiliate link copied to clipboard!')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      message.error('Failed to copy link')
    }
  }

  const columns = [
    {
      title: 'Referred User',
      dataIndex: ['referred', 'name'],
      key: 'name',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Email',
      dataIndex: ['referred', 'email'],
      key: 'email',
      render: (text: string) => <Text>{text}</Text>,
    },
    {
      title: 'Date Joined',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: Date) => <Text>{dayjs(date).format('MMMM D, YYYY')}</Text>,
    },
    {
      title: 'Commission',
      dataIndex: 'commission',
      key: 'commission',
      render: (amount: string) => <Text>${amount}</Text>,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => (
        <Text type={status === 'COMPLETED' ? 'success' : 'warning'}>
          {status}
        </Text>
      ),
    },
  ]

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Title level={2}>
          <i className="las la-users" style={{ marginRight: 8 }} />
          Affiliate Program
        </Title>
        <Text type="secondary" style={{ marginBottom: 24, display: 'block' }}>
          Share your affiliate link and earn commissions when people join
          through your referral.
        </Text>

        <Card style={{ marginBottom: 24 }}>
          <Row gutter={[24, 24]}>
            <Col xs={24} md={8}>
              <Statistic
                title="Total Referrals"
                value={totalReferrals}
                prefix={<i className="las la-user-friends" />}
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Total Earnings"
                value={totalEarnings}
                prefix="$"
              />
            </Col>
            <Col xs={24} md={8}>
              <Statistic
                title="Commission Rate"
                value="10%"
                prefix={<i className="las la-percentage" />}
              />
            </Col>
          </Row>
        </Card>

        <Card title="Your Affiliate Link" style={{ marginBottom: 24 }}>
          <Row gutter={[16, 16]} align="middle">
            <Col xs={24} md={18}>
              <Text copyable style={{ fontSize: 16 }}>
                {affiliateLink}
              </Text>
            </Col>
            <Col xs={24} md={6}>
              <Button
                type="primary"
                icon={<i className="las la-copy" />}
                onClick={handleCopyLink}
                block
              >
                {copied ? 'Copied!' : 'Copy Link'}
              </Button>
            </Col>
          </Row>
        </Card>

        <Card title="Referred Users">
          <Table
            columns={columns}
            dataSource={referrals}
            rowKey="id"
            pagination={{ pageSize: 10 }}
            scroll={{ x: true }}
          />
        </Card>
      </div>
    </PageLayout>
  )
}
