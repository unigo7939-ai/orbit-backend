export type AdminLocale = 'en' | 'zh-CN';

export type AdminTranslation = {
  common: {
    brand: string;
    adminBadge: string;
    logout: string;
    language: string;
    save: string;
    create: string;
    delete: string;
    refresh: string;
    success: string;
    failed: string;
    empty: string;
    actions: string;
    asset: string;
    status: string;
    plan: string;
    role: string;
    wallet: string;
    created: string;
  };
  nav: {
    dashboard: string;
    signals: string;
    predictions: string;
    results: string;
    users: string;
    subscriptions: string;
    score: string;
    settings: string;
  };
  dashboard: {
    title: string;
    description: string;
    stats: {
      signals: string;
      predictions: string;
      results: string;
      users: string;
      subscriptions: string;
    };
  };
  login: {
    title: string;
    subtitle: string;
    connect: string;
    signing: string;
    noWallet: string;
    loginFailed: string;
    notAdmin: string;
    errorPrefix: string;
    siweStatement: string;
  };
  home: {
    title: string;
    description: string;
    healthCheck: string;
    adminLogin: string;
  };
  signals: {
    title: string;
    description: string;
    createTitle: string;
    listTitle: string;
    orbitScore: string;
    opportunity: string;
    risk: string;
    timeWindow: string;
    summary: string;
    reason: string;
    scores: string;
    confirmDelete: string;
  };
  predictions: {
    title: string;
    description: string;
    createTitle: string;
    listTitle: string;
    signal: string;
    entry: string;
    target: string;
    invalid: string;
    position: string;
    action: string;
  };
  results: {
    title: string;
    description: string;
    createTitle: string;
    listTitle: string;
    returnPct: string;
    notes: string;
    verified: string;
  };
  users: {
    title: string;
    description: string;
    nickname: string;
    subscription: string;
  };
  subscriptions: {
    title: string;
    description: string;
    amount: string;
    payment: string;
    period: string;
  };
  score: {
    title: string;
    description: string;
    weights: string;
    moneyFlow: string;
    growth: string;
    social: string;
    marketStructure: string;
    aiConviction: string;
    totalHint: string;
  };
  settings: {
    title: string;
    description: string;
    trackRecord: string;
    plans: string;
    winRate: string;
    avgReturn: string;
    verified: string;
    paymentWallet: string;
    chain: string;
  };
};
