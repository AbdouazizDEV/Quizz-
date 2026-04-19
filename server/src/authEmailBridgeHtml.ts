/**
 * Page servie sur GET / quand l’utilisateur clique sur le lien de confirmation Supabase
 * (Site URL = http://localhost:3000). Le hash avec les jetons n’est pas envoyé au serveur :
 * ce HTML relaie vers le deep link de l’app en repassant les paramètres en query string.
 */
export function buildAuthEmailBridgeHtml(deepLinkBase: string): string {
  const base = JSON.stringify(deepLinkBase);
  return `<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1" />
  <title>Quizz+ — Confirmation</title>
  <style>
    body { font-family: system-ui, sans-serif; padding: 24px; max-width: 420px; margin: 0 auto; }
    p { color: #424242; line-height: 1.5; }
  </style>
</head>
<body>
  <p id="msg">Ouverture de l’application…</p>
  <script>
    (function () {
      var deep = ${base};
      var hash = window.location.hash;
      if (!hash || hash.length < 2) {
        document.getElementById('msg').textContent =
          'Ouvrez ce lien sur le téléphone où l’app Quizz+ est installée.';
        return;
      }
      var qs = hash.substring(1);
      window.location.replace(deep + (deep.indexOf('?') >= 0 ? '&' : '?') + qs);
    })();
  </script>
</body>
</html>`;
}
