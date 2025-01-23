import { GoogleOutlined, LoginOutlined, YoutubeOutlined } from '@ant-design/icons'
import { TikTokIcon } from '@/designSystem/ui/TikTokIcon'
import { Button, Flex } from 'antd'
import React from 'react'
import { Api } from '~/core/trpc'

export const SocialButtons: React.FC = () => {
  const { data } = Api.configuration.getPublic.useQuery()

  const providers = data?.authenticationProviders ?? []

  if (providers.length === 0) {
    return <></>
  }

  const ProviderIcon = (props: { name: string }) => {
    switch (props.name) {
      case 'google':
        return <GoogleOutlined />
      case 'youtube':
        return <YoutubeOutlined />
      case 'tiktok':
        return <TikTokIcon />
      default:
        return <LoginOutlined />
    }
  }

  return (
    <>
      <Flex vertical align="center">
        {providers.map(provider => (
          <a
            key={provider.name}
            href={`/api/auth/${provider.name}`}
            className="w-full"
          >
            <Button
              size="large"
              icon={<ProviderIcon name={provider.name} />}
              block
            >
              Continue with{' '}
              <span style={{ textTransform: 'capitalize' }}>
                {provider.name}
              </span>
            </Button>
          </a>
        ))}
      </Flex>
    </>
  )
}
import React from 'react'

export const TikTokIcon: React.FC = () => (
  <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor">
    <path d="M19.321 5.562a5.122 5.122 0 0 1-.443-.258 6.228 6.228 0 0 1-1.138-1.009 6.244 6.244 0 0 1-1.856-4.415h-3.397v14.88c0 .527-.06 1.039-.174 1.529a3.976 3.976 0 0 1-7.642-.528 3.976 3.976 0 0 1 3.977-3.976c.388 0 .76.056 1.114.159v-3.437a7.4 7.4 0 0 0-1.114-.085A7.423 7.423 0 0 0 1.819 16c0 4.1 3.324 7.423 7.423 7.423 4.1 0 7.424-3.324 7.424-7.423V8.286a10.57 10.57 0 0 0 6.056 1.895V6.744a6.215 6.215 0 0 1-3.401-1.182z"/>
  </svg>
)
