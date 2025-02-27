import { useUserContext } from '@/core/context'
import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'
import {
  Button,
  Card,
  Col,
  Form,
  Input,
  message,
  Modal,
  Row,
  Table,
  Typography,
} from 'antd'
import { useState } from 'react'

interface WithdrawFormValues {
  amount: string
  accountNumber: string
  bankCode: string
}

const { Title, Text } = Typography

export default function WalletPage() {
  const { user } = useUserContext()
  const [withdrawForm] = Form.useForm()
  const [isWithdrawModalVisible, setIsWithdrawModalVisible] = useState(false)
  const [isDepositModalVisible, setIsDepositModalVisible] = useState(false)
  const [depositForm] = Form.useForm()

  const { data: wallet, refetch: refetchWallet } =
    Api.wallet.findFirst.useQuery({
      where: { userId: user?.id },
    })

  const { data: transactions } = Api.transaction.findMany.useQuery({
    where: { userId: user?.id },
    orderBy: { createdAt: 'desc' },
  })

  const { mutateAsync: initiateDeposit } =
    Api.billing.initiateDeposit.useMutation()
  const { mutateAsync: processWithdrawal } =
    Api.billing.processWithdrawal.useMutation()
  const { mutateAsync: validateBankAccount } =
    Api.billing.validateBankAccount.useMutation()

  const handleDeposit = async (event: React.MouseEvent<HTMLElement>) => {
    try {
      const values = await depositForm.validateFields()
      await initiateDeposit({ amount: values.amount })
      setIsDepositModalVisible(false)
      depositForm.resetFields()
      refetchWallet()
      message.success('Deposit initiated successfully')
    } catch (error) {
      message.error('Failed to initiate deposit')
    }
  }

  const handleWithdraw = async (values: WithdrawFormValues) => {
    try {
      await processWithdrawal({
        amount: values.amount,
        bankAccount: {
          accountNumber: values.accountNumber,
          bankCode: values.bankCode
        }
      })

      message.success('Withdrawal processed successfully')
      withdrawForm.resetFields()
      setIsWithdrawModalVisible(false)
      refetchWallet()
    } catch (error) {
      message.error(error.message || 'Failed to process withdrawal')
    }
  }

  const columns = [
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
    },
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => `NGN ${amount}`,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    },
    {
      title: 'Date',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => new Date(date).toLocaleDateString(),
    },
  ]

  return (
    <PageLayout>
      <Row gutter={[24, 24]}>
        <Col xs={24}>
          <Card>
            <Title level={3}>Wallet Balance</Title>
            <Text strong style={{ fontSize: 24 }}>
              NGN {wallet?.balance || '0.00'}
            </Text>
            <div style={{ marginTop: 24 }}>
              <Button
                type="primary"
                onClick={() => setIsDepositModalVisible(true)}
                style={{ marginRight: 16 }}
              >
                Deposit Funds
              </Button>
              <Button onClick={() => setIsWithdrawModalVisible(true)}>
                Withdraw Funds
              </Button>
            </div>
          </Card>
        </Col>

        <Col xs={24}>
          <Card>
            <Title level={3}>Transaction History</Title>
            <Table
              columns={columns}
              dataSource={transactions}
              rowKey="id"
              pagination={{ pageSize: 10 }}
            />
          </Card>
        </Col>
      </Row>

      <Modal
        title="Deposit Funds"
        open={isDepositModalVisible}
        onOk={handleDeposit}
        onCancel={() => setIsDepositModalVisible(false)}
      >
        <Form form={depositForm}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter deposit amount' },
              { pattern: /^\d+$/, message: 'Please enter a valid amount' },
            ]}
          >
            <Input prefix="NGN" />
          </Form.Item>
        </Form>
      </Modal>

      <Modal
        title="Withdraw Funds"
        open={isWithdrawModalVisible}
        onOk={() => withdrawForm.submit()}
        onCancel={() => setIsWithdrawModalVisible(false)}
      >
        <Form form={withdrawForm} onFinish={handleWithdraw}>
          <Form.Item
            name="amount"
            label="Amount"
            rules={[
              { required: true, message: 'Please enter withdrawal amount' },
              { pattern: /^\d+$/, message: 'Please enter a valid amount' },
            ]}
          >
            <Input prefix="NGN" />
          </Form.Item>
          <Form.Item
            name="accountNumber"
            label="Account Number"
            rules={[
              { required: true, message: 'Please enter account number' },
              {
                pattern: /^\d+$/,
                message: 'Account number must contain only digits',
              },
            ]}
          >
            <Input />
          </Form.Item>
          <Form.Item
            name="bankCode"
            label="Bank Code"
            rules={[
              { required: true, message: 'Please enter bank code' },
              {
                pattern: /^[A-Z0-9]+$/,
                message: 'Bank code must be alphanumeric',
              },
            ]}
          >
            <Input />
          </Form.Item>
        </Form>
      </Modal>
    </PageLayout>
  )
}
