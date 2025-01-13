import {
  Typography,
  Card,
  Button,
  Table,
  InputNumber,
  Modal,
  message,
  Row,
  Col,
  Statistic,
} from 'antd'
import { useState } from 'react'
const { Title, Text } = Typography
import { useUserContext } from '@/core/context'
import dayjs from 'dayjs'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { useUploadPublic } from '@/plugins/upload/client'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'

export default function WalletPage() {
  const { user } = useUserContext()
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0)
  const [isModalOpen, setIsModalOpen] = useState(false)

  // Fetch wallet data
  const { data: wallet, refetch: refetchWallet } =
    Api.wallet.findFirst.useQuery({
      where: { userId: user?.id },
      include: { user: true },
    })

  // Fetch transactions
  const { data: transactions } = Api.transaction.findMany.useQuery({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' },
    include: { referral: true },
  })

  // Fetch referrals
  const { data: referrals } = Api.referral.findMany.useQuery({
    where: { referrerId: user?.id },
    include: { referred: true },
  })

  // Withdraw mutation
  const { mutateAsync: createTransaction } =
    Api.transaction.create.useMutation()

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) {
      message.error('Please enter a valid amount')
      return
    }

    const currentBalance = parseFloat(wallet?.balance || '0')
    if (withdrawAmount > currentBalance) {
      message.error('Insufficient balance')
      return
    }

    try {
      await createTransaction({
        data: {
          amount: withdrawAmount.toString(),
          type: 'WITHDRAWAL',
          status: 'COMPLETED',
          userId: user?.id,
        },
      })

      message.success('Withdrawal successful')
      setIsModalOpen(false)
      refetchWallet()
    } catch (error) {
      message.error('Withdrawal failed')
    }
  }

  const transactionColumns = [
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => `$${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
  ]

  return (
    <PageLayout layout="full-width">
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px' }}>
        <Title level={2}>
          <i className="las la-wallet" style={{ marginRight: 8 }}></i>
          My Wallet
        </Title>
        <Text type="secondary">
          Manage your earnings and track your transactions
        </Text>

        <Row gutter={24} style={{ marginTop: 24 }}>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Current Balance"
                value={parseFloat(wallet?.balance || '0')}
                prefix="$"
                precision={2}
              />
              <Button
                type="primary"
                onClick={() => setIsModalOpen(true)}
                style={{ marginTop: 16 }}
              >
                <i className="las la-money-bill" style={{ marginRight: 8 }}></i>
                Withdraw Funds
              </Button>
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Total Earnings"
                value={parseFloat(wallet?.totalEarnings || '0')}
                prefix="$"
                precision={2}
              />
            </Card>
          </Col>
          <Col xs={24} sm={12} md={8}>
            <Card>
              <Statistic
                title="Active Referrals"
                value={referrals?.length || 0}
                prefix={<i className="las la-users"></i>}
              />
            </Card>
          </Col>
        </Row>

        <Card style={{ marginTop: 24 }}>
          <Title level={4}>
            <i className="las la-history" style={{ marginRight: 8 }}></i>
            Transaction History
          </Title>
          <Table
            dataSource={transactions}
            columns={transactionColumns}
            rowKey="id"
            pagination={{ pageSize: 10 }}
          />
        </Card>

        <Modal
          title="Withdraw Funds"
          open={isModalOpen}
          onOk={handleWithdraw}
          onCancel={() => setIsModalOpen(false)}
        >
          <Text>Enter amount to withdraw:</Text>
          <InputNumber
            style={{ width: '100%', marginTop: 16 }}
            prefix="$"
            min={0}
            max={parseFloat(wallet?.balance || '0')}
            precision={2}
            value={withdrawAmount}
            onChange={value => setWithdrawAmount(value || 0)}
          />
        </Modal>
      </div>
    </PageLayout>
  )
}
