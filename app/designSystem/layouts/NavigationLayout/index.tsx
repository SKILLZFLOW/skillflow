import { useUserContext } from '@/core/context'
import { Api } from '@/core/trpc'
import { useLocation, useNavigate, useParams } from '@remix-run/react'
import { Flex } from 'antd'
import { ReactNode } from 'react'
import { Leftbar } from './components/Leftbar'
import { Mobilebar } from './components/Mobilebar'
import { Topbar } from './components/Topbar'
import { NavigationItem } from './types'

interface Props {
  children: ReactNode
}

export const NavigationLayout: React.FC<Props> = ({ children }) => {
  const router = useNavigate()
  const pathname = useLocation().pathname
  const params: Record<string, string> = useParams()

  const { checkRole } = useUserContext()
  const { mutateAsync: logout } = Api.authentication.logout.useMutation({
    onSuccess: data => {
      if (data.redirect) {
        window.location.href = data.redirect
      }
    },
  })

  const goTo = (url: string) => {
    router(url)
  }

  const items: NavigationItem[] = [
    {
      key: '/admin/control-panel',
      label: 'Control Panel',
      position: 'leftbar',
      icon: <i className="las la-cogs"></i>,
      onClick: () => goTo('/admin/control-panel'),
      isVisible: checkRole('ADMIN'),
    },
    {
      key: '/skillfeed',
      label: 'Skill Feed',
      position: 'topbar',
      icon: <i className="las la-play-circle"></i>,
      onClick: () => goTo('/skillfeed'),
    },
    {
      key: '/courses',
      label: 'Courses',
      position: 'topbar',
      onClick: () => goTo('/courses'),
    },

    {
      key: '/wallet',
      label: 'Wallet',
      position: 'topbar',

      onClick: () => goTo('/wallet'),
    },

    {
      key: '/affiliate',
      label: 'Affiliate',
      position: 'topbar',

      onClick: () => goTo('/affiliate'),
    },

    {
      key: '/settings',
      label: 'Settings',
      position: 'topbar',
      onClick: () => goTo('/settings'),
    },
    {
      key: '/logout',
      label: 'Logout',
      position: 'topbar',
      onClick: () => logout(),
    },
  ]

  const itemsVisible = items
    .filter(item => item.isVisible !== false)
    .map(item => ({
      key: item.key,
      label: item.label,
      icon: item.icon,
      position: item.position,
      onClick: item.onClick,
    }))

  const itemsTopbar = itemsVisible.filter(item => item.position === 'topbar')

  const itemsLeftbar = itemsVisible.filter(item => item.position === 'leftbar')

  const itemsLeftbottom = itemsVisible.filter(
    item => item.position === 'leftbar-bottom',
  )

  const itemsMobile = itemsVisible

  let keySelected = pathname

  Object.entries(params).forEach(([key, value]) => {
    keySelected = keySelected.replace(`/${value}`, `/:${key}`)
  })

  return (
    <>
      <Topbar keySelected={keySelected} items={itemsTopbar} />

      <Mobilebar keySelected={keySelected} items={itemsMobile} />

      <Flex flex={1} style={{ overflowY: 'hidden' }}>
        <Leftbar
          keySelected={keySelected}
          items={itemsLeftbar}
          itemsBottom={itemsLeftbottom}
        />

        <Flex flex={1} vertical style={{ overflowY: 'hidden' }}>
          {children}
        </Flex>
      </Flex>
    </>
  )
}
