import { Api } from '@/core/trpc'
import { PageLayout } from '@/designSystem'
import { Typography } from 'antd'

const { Paragraph, Title } = Typography

export default function SkillFeedPage() {
  const { data: videos } = Api.skillFeedVideo.findMany.useQuery()

  return (
    <PageLayout layout="full-width">
      <div className="flex flex-col gap-4 p-4">
        {videos?.map(video => (
          <div key={video.id} className="w-full">
            <iframe
              src={video.link.replace(
                'www.youtube.com/watch?v=',
                'www.youtube.com/embed/',
              )}
              className="w-full aspect-video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
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
