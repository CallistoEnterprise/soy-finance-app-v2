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
