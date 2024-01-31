"use client";
import Container from "@/components/atoms/Container";
import { IconName } from "@/config/types/IconName";
import SocialIconButton from "@/components/buttons/SocialIconLink";
import ThemedLogo from "@/components/ThemedLogo";
import { useSOYPrice } from "@/hooks/useCLOPrice";

type FooterLink = {
  label: string,
  url: string | null
}

export const supportLinks: FooterLink[] = [
  {
    label: "FAQ",
    url: null
  },
  {
    label: "Telegram",
    url: "https://t.me/Soy_Finance"
  },
  {
    label: "Tokenomics",
    url: "https://docs.soy.finance/soy-products/soy-token/monetary-policy-vision"
  },
  {
    label: "Investor deck",
    url: "https://clo.click/SOY-Deck"
  }
];

export const tradingLinks: FooterLink[] = [
  {
    label: "Token audits",
    url: "https://docs.soy.finance/soy-products/safelistings/projects-safelisted"
  },
  {
    label: "ERC 223 token standard",
    url: "https://docs.soy.finance/soy-products/safety-on-yields/erc-223-token-standard"
  },
  {
    label: "Platform audit report",
    url: "https://docs.soy.finance/soy-products/safety-on-yields/soy-finance-security-audit"
  },
  {
    label: "Bug bounty",
    url: "https://docs.soy.finance/soy-products/safety-on-yields/soy-finance-bug-bounty"
  },
  {
    label: "Documentation",
    url: "https://docs.soy.finance/"
  }
];

export const engageLinks: FooterLink[] = [
  {
    label: "SlothTV",
    url: "https://www.youtube.com/watch?v=vbtED4Z_82I&list=PLY-khVKjGjWgLeiBI3Y3jP5nIrqpoEkRK"
  },
  {
    label: "Developer grants",
    url: ""
  },
  {
    label: "Governance",
    url: ""
  },
  {
    label: "Github",
    url: "https://github.com/CallistoEnterprise"
  },
  {
    label: "Team",
    url: "https://docs.soy.finance/miscellaneous/callisto-enterprise-team"
  }
];

export const footerLinks: {
  groupLabel: string,
  links: FooterLink[]
}[] = [
  {
    groupLabel: "Support",
    links: supportLinks
  },
  {
    groupLabel: "Safe trading",
    links: tradingLinks
  },
  {
    groupLabel: "Engage",
    links: engageLinks
  }
]

export const socialLinks: Array<{
  icon: IconName,
  link: string
}> = [
  {
    icon: "twitter",
    link: "https://twitter.com/SoyFinance"
  },
  {
    icon: "telegram",
    link: "https://t.me/Soy_Finance"
  },
  {
    icon: "reddit",
    link: "https://www.reddit.com/r/Soy_Finance/"
  },
  {
    icon: "facebook",
    link: "https://www.facebook.com/Soy.Finance"
  },
  {
    icon: "defilama",
    link: "https://defillama.com/protocol/soy-finance"
  },
  {
    icon: "coingecko",
    link: "https://www.geckoterminal.com/callisto/soy-finance-callisto/pools"
  },
  {
    icon: "coinmarketcup",
    link: "https://coinmarketcap.com/currencies/soy-finance/"
  },
  {
    icon: "coinpaprika",
    link: "https://coinpaprika.com/coin/soy-soy-finance/"
  }
];



export default function Footer() {
  const soyPrice = useSOYPrice();

  return <Container>
    <footer className="pb-5 sm:pb-0 sm:rounded-5 overflow-hidden mb-5 bg-primary-bg border-y sm:border border-primary-border">
      <div className="grid xl:flex p-4 xl:pt-5 xl:px-10 xl:pb-10 justify-between border-b border-primary-border">
        <div className="pt-3">
          <div className="mb-[14px]">
            <ThemedLogo/>
          </div>

          <span className="text-16 text-secondary-text font-medium">Where DeFi Meets Safety</span>
          <div className="flex gap-2.5 my-5">
            <div className="flex items-center h-10 px-2.5 border border-primary-border rounded-2 gap-0.5">
              <img src="/images/all-tokens/SOY-TRANSPARENT.svg" alt=""/>
              <span className="text-primary-text text-16 font-medium">1 SOY = ${soyPrice ? soyPrice.toFixed(5) : "Loading..."}</span>
            </div>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            {socialLinks.map((item, index) => {
              return <a aria-label={item.icon} key={index} target="_blank" href={item.link}>
                <SocialIconButton icon={item.icon}/>
              </a>
            })}
          </div>
        </div>
        <div className="grid xl:flex gap-6 xl:gap-[120px] pt-5">
          {footerLinks.map((group) => {
            return <div key={group.groupLabel}>
              <h3 className="font-bold text-primary-text mb-4 text-20">{group.groupLabel}</h3>
              <div className="flex flex-col gap-2.5 font-medium">
                {group.links.map((link) => {
                  if (link.url) {
                    return <a className="duration-200 hover:text-green" target="_blank" href={link.url}
                              key={link.label}>{link.label}</a>
                  }

                  return <a className="duration-200 hover:text-green" onClick={(e) => {
                    e.preventDefault();
                    // showMessage("Coming soon...", "info");
                  }} href="" key={link.label}>{link.label}</a>
                })}
              </div>
            </div>
          })}
        </div>
      </div>
      <div className="p-4 mb-5 sm:mb-0 sm:px-10 sm:py-5 flex justify-between items-center text-12 sm:text-16">
        <span className="text-secondary-text text-12 sm:text-16">©2023 All rights reserved</span>
        <div className="flex items-center gap-3 sm:gap-5">
          <a href="#">Terms</a>
          <a href="#">Privacy Policy</a>
        </div>
      </div>
    </footer>
  </Container>
}
