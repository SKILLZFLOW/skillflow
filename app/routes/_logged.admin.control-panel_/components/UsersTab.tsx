import { Button, Table, message, Select, Typography } from 'antd'
import { Api } from '@/core/trpc'
import { useState } from 'react'
import dayjs from 'dayjs'

const { Title } = Typography

export default function UsersTab() {
  const { data: users, isLoading, refetch } = Api.user.findMany.useQuery()
  const { mutateAsync: updateUser } = Api.user.update.useMutation()
  const { mutateAsync: deleteUser } = Api.user.delete.useMutation()

  const handleStatusChange = async (userId: string, newStatus: 'INVITED' | 'VERIFIED') => {
    try {
      await updateUser({
        where: { id: userId },
        data: { status: newStatus }
      })
      message.success('User status updated successfully')
      refetch()
    } catch (error) {
      message.error('Failed to update user status')
    }
  }

  const handleRoleChange = async (userId: string, newRole: string) => {
    try {
      await updateUser({
        where: { id: userId },
        data: { globalRole: newRole }
      })
      message.success('User role updated successfully')
      refetch()
    } catch (error) {
      message.error('Failed to update user role')
    }
  }

  const handleDelete = async (userId: string) => {
    try {
      await deleteUser({ where: { id: userId } })
      message.success('User deleted successfully')
      refetch()
    } catch (error) {
      message.error('Failed to delete user')
    }
  }

  const columns = [
    {
      title: 'Name',
      dataIndex: 'name',
      key: 'name',
    },
    {
      title: 'Email',
      dataIndex: 'email',
      key: 'email',
    },
    {
      title: 'Status',
      dataIndex: 'status',
      key: 'status',
      render: (status: string, record: any) => (
        <Select
          value={status}
          onChange={(value: 'INVITED' | 'VERIFIED') => handleStatusChange(record.id, value)}
          style={{ width: 120 }}
        >
          <Select.Option value="INVITED">Invited</Select.Option>
          <Select.Option value="VERIFIED">Verified</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Role',
      dataIndex: 'globalRole',
      key: 'globalRole',
      render: (role: string, record: any) => (
        <Select
          value={role}
          onChange={(value) => handleRoleChange(record.id, value)}
          style={{ width: 120 }}
        >
          <Select.Option value="USER">User</Select.Option>
          <Select.Option value="ADMIN">Admin</Select.Option>
        </Select>
      ),
    },
    {
      title: 'Created At',
      dataIndex: 'createdAt',
      key: 'createdAt',
      render: (date: string) => dayjs(date).format('YYYY-MM-DD HH:mm'),
    },
    {
      title: 'Actions',
      key: 'actions',
      render: (_: any, record: any) => (
        <div className="flex gap-2">
          <Button
            onClick={() => handleStatusChange(record.id, record.status === 'VERIFIED' ? 'INVITED' : 'VERIFIED')}
          >
            {record.status === 'VERIFIED' ? 'Suspend' : 'Activate'}
          </Button>
          <Button danger onClick={() => handleDelete(record.id)}>
            Delete
          </Button>
        </div>
      ),
    },
  ]

  return (
    <div className="p-4">
      <Title level={3}>Users Management</Title>
      <Table
        columns={columns}
        dataSource={users}
        rowKey="id"
        loading={isLoading}
        pagination={{ pageSize: 10 }}
      />
    </div>
  )
}
