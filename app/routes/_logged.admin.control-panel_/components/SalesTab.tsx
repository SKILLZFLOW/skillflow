import { Button, Table, message, Select, Typography, Card, Row, Col, Statistic } from 'antd'
import { Api } from '@/core/trpc'
import { useState } from 'react'
import dayjs from 'dayjs'

const { Title } = Typography

export default function SalesTab() {
  const { data: transactions, isLoading, refetch } = Api.transaction.findMany.useQuery()
  const [typeFilter, setTypeFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)

  const totalSales = transactions?.reduce((sum, transaction) => {
    return sum + (transaction.status === 'COMPLETED' ? Number(transaction.amount) || 0 : 0)
  }, 0) || 0

  const columns = [
    {
      title: 'Amount',
      dataIndex: 'amount',
      key: 'amount',
      render: (amount: string) => `$${amount}`,
    },
    {
      title: 'Type',
      dataIndex: 'type',
      key: 'type',
      filters: [
        { text: 'Purchase', value: 'PURCHASE' },
        { text: 'Refund', value: 'REFUND' },
        { text: 'Commission', value: 'COMMISSION' },
      ],
      onFilter: (value: string, record) => record.type === value,
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      filters: [
        { text: 'Pending', value: 'PENDING' },
        { text: 'Completed', value: 'COMPLETED' },
        { text: 'Failed', value: 'FAILED' },
      ],
      onFilter: (value: string, record) => record.status === value,
    },
    {
      title: 'User ID',
      dataIndex: 'userId',
      key: 'userId',
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
      sorter: (a, b) => dayjs(a.createdAt).unix() - dayjs(b.createdAt).unix(),
    },
  ]

  return (
    <div className="p-4">
      <Title level={3}>Sales Analytics</Title>
      
      <Card className="mb-4">
        <Row gutter={16}>
          <Col span={8}>
            <Statistic
              title="Total Sales"
              value={totalSales}
              prefix="$"
              precision={2}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Total Transactions"
              value={transactions?.length || 0}
            />
          </Col>
          <Col span={8}>
            <Statistic
              title="Average Transaction"
              value={transactions?.length ? (totalSales / transactions.length) : 0}
              prefix="$"
              precision={2}
            />
          </Col>
        </Row>
      </Card>

      <Table
        columns={columns}
        dataSource={transactions}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
