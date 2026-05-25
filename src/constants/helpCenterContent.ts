export interface HelpFaqEntry {
  id: string;
  question: string;
  answer: string;
}

export interface HelpContactEntry {
  id: string;
  label: string;
  subtitle: string;
  icon: 'mail' | 'globe' | 'message-circle';
  iconBackground: string;
  iconColor: string;
  action: 'mailto' | 'url';
  target: string;
}

export const HELP_FAQ_ENTRIES: HelpFaqEntry[] = [
  {
    id: 'account',
    question: 'Comment modifier mes informations personnelles ?',
    answer:
      'Ouvrez le menu Paramètres → Informations personnelles. Vous pouvez y mettre à jour votre nom, pseudo, téléphone, bio et préférences de profil, puis enregistrer.',
  },
  {
    id: 'quiz',
    question: 'Comment fonctionne un quiz sur Quizz+ ?',
    answer:
      'Choisissez une catégorie, lancez un quiz et répondez aux questions dans le temps imparti. Votre score est enregistré et peut apparaître dans le classement du quiz.',
  },
  {
    id: 'duel',
    question: 'Comment défier un ami ?',
    answer:
      'Depuis l’onglet Défis, invitez un ami suivi à un duel sur un quiz. Il dispose de 30 minutes pour accepter, puis chacun joue sa partie.',
  },
  {
    id: 'offline',
    question: 'Puis-je utiliser l’app hors ligne ?',
    answer:
      'Certaines données (profil, défis, tournois) sont mises en cache sur votre téléphone. Une connexion est nécessaire pour synchroniser les scores et recevoir les notifications.',
  },
  {
    id: 'notifications',
    question: 'Où voir mes notifications ?',
    answer:
      'Paramètres → Notifications : demandes d’amis, défis, résultats et annonces. Vous pouvez tout marquer comme lu ou supprimer une notification.',
  },
  {
    id: 'password',
    question: 'J’ai oublié mon mot de passe',
    answer:
      'Sur l’écran de connexion, touchez « Mot de passe oublié » et suivez les étapes par e-mail pour recevoir un code de réinitialisation.',
  },
];

export const HELP_CONTACT_ENTRIES: HelpContactEntry[] = [
  {
    id: 'email',
    label: 'Nous écrire',
    subtitle: 'support@quizzplus.app',
    icon: 'mail',
    iconBackground: '#E3F2FD',
    iconColor: '#1565C0',
    action: 'mailto',
    target: 'mailto:support@quizzplus.app?subject=Support%20Quizz%2B',
  },
  {
    id: 'web',
    label: 'Site web',
    subtitle: 'quizzplus.app',
    icon: 'globe',
    iconBackground: '#E8F5E9',
    iconColor: '#2E7D32',
    action: 'url',
    target: 'https://quizzplus.app',
  },
];
