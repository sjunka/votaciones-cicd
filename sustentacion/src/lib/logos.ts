import type { LogoId } from './tipos'
import github from '../assets/logos/github.svg'
import githubactions from '../assets/logos/githubactions.svg'
import docker from '../assets/logos/docker.svg'
import python from '../assets/logos/python.svg'
import laptop from '../assets/logos/laptop.svg'
import lock from '../assets/logos/lock.svg'
import ecs from '../assets/logos/ecs.svg'
import elb from '../assets/logos/elb.svg'
import s3 from '../assets/logos/s3.svg'
import cloudwatch from '../assets/logos/cloudwatch.svg'
import terraform from '../assets/logos/terraform.svg'
import fargate from '../assets/logos/fargate.svg'
import react from '../assets/logos/react.svg'
import vite from '../assets/logos/vite.svg'
import pytest from '../assets/logos/pytest.svg'
import selenium from '../assets/logos/selenium.svg'
import discord from '../assets/logos/discord.svg'
import dynamodb from '../assets/logos/dynamodb.svg'
import release from '../assets/logos/release.svg'
import internet from '../assets/logos/internet.svg'

/** inv: logo oscuro que se invierte en tema oscuro. */
export const logos: Record<LogoId, { src: string; inv?: boolean }> = {
  github: { src: github, inv: true },
  githubactions: { src: githubactions },
  docker: { src: docker },
  python: { src: python },
  laptop: { src: laptop, inv: true },
  lock: { src: lock, inv: true },
  ecs: { src: ecs },
  elb: { src: elb },
  s3: { src: s3 },
  cloudwatch: { src: cloudwatch },
  terraform: { src: terraform },
  fargate: { src: fargate },
  react: { src: react },
  vite: { src: vite },
  pytest: { src: pytest },
  selenium: { src: selenium },
  discord: { src: discord },
  dynamodb: { src: dynamodb },
  release: { src: release },
  internet: { src: internet, inv: true },
}
