import { Table, Typography } from 'antd'
import { useState } from 'react'

const { Title } = Typography

export default function SkillfeedTab() {
  const [isLoading] = useState(false)

  const columns = [
    {
      title: 'Skill Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Category',
      dataIndex: 'category',
      key: 'category',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
    }
  ]

  const placeholderData = [
    {
      key: '1',
      name: 'Coming Soon',
      category: 'Coming Soon',
      status: 'Coming Soon'
    }
  ]

  return (
    <div className="p-4">
      <div className="flex justify-between items-center mb-4">
        <Title level={3}>Skillfeed Management</Title>
      </div>

      <div className="mb-4">
        <Typography.Text type="secondary">
          Skillfeed management features are coming soon. This section will allow managing skill-related content.
        </Typography.Text>
      </div>

      <Table
        columns={columns}
        dataSource={placeholderData}
        loading={isLoading}
        pagination={false}
      />
    </div>
  )
}
