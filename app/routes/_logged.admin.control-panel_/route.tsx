import { useUserContext } from '@/core/context'
import { PageLayout } from '@/designSystem'
import { useNavigate } from '@remix-run/react'
import { Tabs, Typography } from 'antd'
import { useEffect } from 'react'
import UsersTab from './components/UsersTab'
import SkillFeedTab from './components/SkillFeedTab'
const { Title } = Typography

export default function AdminControlPanel() {
  const { checkRole } = useUserContext()
  const navigate = useNavigate()

  useEffect(() => {
    if (!checkRole('ADMIN')) {
      navigate('/home')
    }
  }, [checkRole])

  const items = [
    {
      key: 'users',
      label: 'Users',
      children: <UsersTab />,
    },
    {
      key: 'sales',
      label: 'Sales',
      children: (
        <div className="p-4">
          <Title level={3}>Sales Analytics</Title>
        </div>
      ),
    },
    {
      key: 'courses',
      label: 'Courses',
      children: (
        <div className="p-4">
          <Title level={3}>Courses Management</Title>
        </div>
      ),
    },
    {
      key: 'skillfeed',
      label: 'Skillfeed', 
      children: (
        <div className="p-4">
          <Title level={3}>Skillfeed Management</Title>
          <SkillFeedTab />
        </div>
      ),
    },
  ]

  return (
    <PageLayout layout="full-width">
      <div className="p-4">
        <Title level={2}>Admin Control Panel</Title>
        <Tabs items={items} />
      </div>
    </PageLayout>
  )
}
