import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'
import { Typography } from 'antd'
import { useEffect } from 'react'

const { Paragraph, Title } = Typography

const isYoutubeUrl = (url: string) => {
  return url.includes('youtube.com/watch?v=') || url.includes('youtu.be/')
}

const isTiktokUrl = (url: string) => {
  return url.includes('tiktok.com')
}

export default function SkillFeedPage() {
  const { data: videos } = Api.skillFeedVideo.findMany.useQuery()

  useEffect(() => {
    const loadTikTokScript = () => {
      const script = document.createElement('script')
      script.src = 'https://www.tiktok.com/embed.js'
      script.async = true
      document.body.appendChild(script)
      return () => document.body.removeChild(script)
    }
    loadTikTokScript()
  }, [])

  return (
    <PageLayout layout="full-width">
      <div className="flex flex-col scroll-smooth snap-y snap-mandatory h-[90vh] overflow-y-scroll">
        {videos?.map(video => (
          <div
            key={video.id}
            className="w-full h-[90vh] flex flex-col justify-center video-container snap-start snap-always"
          >
            {isYoutubeUrl(video.link) ? (
              <iframe
                src={video.link.replace(
                  /(youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/,
                  'youtube.com/embed/$2'
                )}
                className="w-full h-[90vh] mx-auto rounded-lg"
                width="100%"
                height="100%"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
            ) : isTiktokUrl(video.link) ? (
              <blockquote
                className="tiktok-embed mx-auto"
                cite={video.link}
                data-video-id={video.link.split('/').pop()}
                data-section="true"
                style={{ width: '325px', height: '90vh' }}
              >
                <section></section>
              </blockquote>
            ) : (
              <div className="text-center text-red-500">
                Unsupported video format
              </div>
            )}
            <div className="mt-2">
              <Title level={4}>{video.title}</Title>
              <Paragraph
                ellipsis={{ rows: 2, expandable: true, symbol: 'Read More' }}
              >
                {video.description}
              </Paragraph>
            </div>
          </div>
        ))}
      </div>
    </PageLayout>
  )
}
