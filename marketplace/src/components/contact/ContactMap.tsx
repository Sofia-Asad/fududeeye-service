import { CONTACT_INFO } from '@/constants/nav'
import Container from '@/layout/Container'
import Section from '@/layout/Section'

const MAP_QUERY = encodeURIComponent(CONTACT_INFO.addressLines.join(', '))
const MAP_EMBED_SRC = `https://www.google.com/maps?q=${MAP_QUERY}&output=embed`

export default function ContactMap() {
  return (
    <Section className="py-8">
      <Container>
        <div className="overflow-hidden rounded-lg border border-border shadow-md">
          <iframe
            title="Fududeeye office location"
            src={MAP_EMBED_SRC}
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="h-[340px] w-full sm:h-[420px]"
          />
        </div>
      </Container>
    </Section>
  )
}
