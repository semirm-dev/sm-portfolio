<script setup lang="ts">
import EngineerManifest from '~/components/portfolio/EngineerManifest.vue'
import SectionHead from '~/components/portfolio/SectionHead.vue'
import SkillCard from '~/components/portfolio/SkillCard.vue'
import WorkCard from '~/components/portfolio/WorkCard.vue'

const EMAIL = 'smahovkic89@gmail.com'
const GITHUB = 'https://github.com/semirm-dev'

usePageSeo({
  title: 'Senior Software Engineer',
  description: 'Senior software engineer with over 11 years of experience. Golang, Kubernetes and cloud-native technologies — soft real-time systems, asynchronous communications and distributed applications.',
})

const { projects } = await useCareer()
const projectCount = computed(() => projects.value.length)
</script>

<template>
  <div>
    <section class="border-b border-rule">
      <!--
        Three cells, not two: the headline spans the full width on its own row,
        so the columns below it are free to size themselves to their content
        rather than to the longest line of type on the page.
        The summary takes the slack (1fr) and the manifest is capped at the
        width its dozen short YAML lines actually need — sized the other way
        round, the card grows into a mostly-empty dark panel.
        The two are centred against each other rather than stretched: the card
        is usually the taller of the pair, and stretching left the summary
        hanging from the top of the row with a gap under its buttons.
      -->
      <div class="mx-auto grid max-w-[110rem] gap-x-10 gap-y-8 px-6 py-16 lg:px-10 lg:grid-cols-[minmax(0,1fr)_minmax(0,38rem)] lg:items-center">
        <div class="lg:col-span-2">
          <p
            class="animate-rise text-[12.5px] font-semibold uppercase tracking-[0.14em] text-accent"
            style="animation-delay: 60ms"
          >
            Senior Software Engineer
          </p>
          <h1
            class="animate-rise mt-4 text-[clamp(35px,4.6vw,58px)] font-bold leading-[1.04] tracking-[-0.042em] text-balance"
            style="animation-delay: 120ms"
          >
            I build backends that <em class="not-italic text-accent">hold under load</em>.
          </h1>
        </div>

        <div>
          <div
            class="animate-rise max-w-[54ch] space-y-3 text-[16.5px] leading-[1.72] text-muted lg:max-w-none xl:text-[18px] xl:leading-[1.75] 2xl:text-[19.5px]"
            style="animation-delay: 180ms"
          >
            <p>
              Over 11 years of experience in software development, I specialize in
              <span class="font-medium text-accent">Golang</span>,
              <span class="font-medium text-accent">Kubernetes</span>, and cloud-native
              technologies. My expertise covers soft real-time systems,
              asynchronous communications, and distributed applications
              for some really cool and big projects (<strong class="font-medium text-ink">Cisco's Cloud Native Firewall</strong>,
              <strong class="font-medium text-ink">Sportradar's data sync/streaming platform</strong>,
              <strong class="font-medium text-ink">Agilent's laboratory custom analysis</strong>,
              <strong class="font-medium text-ink">low latency trading platform &mdash; submillisecond</strong>), utilizing tools like <strong class="font-medium text-ink">RabbitMQ</strong>,
              <strong class="font-medium text-ink">MQTT</strong>, <strong class="font-medium text-ink">SQS/SNS</strong>,
              <strong class="font-medium text-ink">PubSub</strong>, <strong class="font-medium text-ink">gRPC</strong>,
              <strong class="font-medium text-ink">Aeron</strong> and <strong class="font-medium text-ink">WebSockets</strong>.
            </p>
            <p>
              Additionally, I have experience setting up, configuring and
              implementing Keycloak IAM on Kubernetes environments,
              integrating it with Grafana, ArgoCD and backend services
              (Golang and .NET) to enable seamless authentication and
              access control.
            </p>
            <p>
              I can take full ownership of an application's lifecycle —
              from coding and building to deploying and monitoring.
            </p>
          </div>

          <div
            class="animate-rise mt-6 flex flex-wrap gap-2.5"
            style="animation-delay: 240ms"
          >
            <a
              :href="`mailto:${EMAIL}`"
              class="rounded-lg bg-accent px-4.5 py-2.5 text-[14px] font-medium text-on-accent shadow-[0_8px_20px_-10px_rgba(45,70,185,0.7)] transition-colors hover:bg-accent-deep focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >Email me</a>
            <a
              :href="GITHUB"
              rel="noopener noreferrer"
              target="_blank"
              class="rounded-lg border border-accent-rule bg-ground px-4.5 py-2.5 text-[14px] font-medium text-accent transition-colors hover:border-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
            >GitHub</a>
          </div>
        </div>

        <div
          class="animate-rise"
          style="animation-delay: 220ms"
        >
          <EngineerManifest />
        </div>
      </div>
    </section>

    <section class="border-b border-rule bg-band">
      <div class="mx-auto max-w-[110rem] px-6 py-16 lg:px-10">
        <SectionHead id="stack">
          Technical skills
        </SectionHead>

        <div class="grid gap-3 md:grid-cols-2">
          <SkillCard name="Golang">
            RabbitMQ · MQTT · SQS · SNS · gRPC + streams · WebSockets ·
            Kubernetes Operators · Gin · Gorm · Jaeger · Docker · GraphQL ·
            Temporal · FX · Wire · Aeron · FIX · Claude Code
          </SkillCard>
          <SkillCard name="PHP">
            Laravel · Websockets · Redis · MySQL · SQS/SNS · Postgres ·
            RabbitMQ · Inertia · Notifications · Reverb · Social Logins ·
            PDF generating · Claude Code
          </SkillCard>
          <SkillCard name="C#">
            .NET Core · IdentityServer4 · HangFire · Jaeger · WebSockets ·
            Automapper · Docker
          </SkillCard>
          <SkillCard name="Kubernetes">
            Operators/CRDs · Helm charts · ArgoCD (app-of-apps) · Prometheus
            · Loki · RabbitMQ · Jaeger · Elasticsearch · Grafana ·
            OpenTelemetry Collector · SealedSecrets
          </SkillCard>
        </div>
      </div>
    </section>

    <section>
      <div class="mx-auto max-w-[110rem] px-6 py-16 lg:px-10">
        <SectionHead>
          Selected work
        </SectionHead>

        <div class="grid gap-3 lg:grid-cols-3">
          <WorkCard
            org="Endava · Cisco"
            title="Secure Firewall Cloud Native"
          >
            Led a team building Kubernetes Operators for Cisco's firewall
            and VPN. Designed an Operator that wires AWS Shield into newly
            deployed services, and tightened access control across
            Kubernetes RBAC and AWS IAM.
          </WorkCard>
          <WorkCard
            org="ByteBuds · TVM"
            title="TradeView Markets"
          >
            Low-latency (sub-millisecond) backend for an online trading
            platform with zero allocations in the hot path. Aeron for
            inter-service transport, FIX integration with multiple liquidity
            providers, end-to-end order execution.
          </WorkCard>
          <WorkCard
            org="Endava · Sportradar"
            title="Sportradar"
          >
            Real-time data synchronisation services for Sportradar, a
            leading sports streaming platform. Golang, gRPC streams and
            Kubernetes, kept low-latency across the distribution path.
          </WorkCard>
        </div>

        <p class="mt-6 text-center">
          <NuxtLink
            to="/work"
            class="text-[14.5px] font-medium text-accent hover:underline focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent"
          >
            All {{ projectCount }} projects →
          </NuxtLink>
        </p>
      </div>
    </section>
  </div>
</template>
