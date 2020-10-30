# attestation-assistant

Tout simple:

- créer un compte ici : https://attestation-assistant.web.app/
- récupérer le lien api
- créer un compte ifttt
- créer une nouvel applet https://ifttt.com/create
- cliquer sur if this : choisir google assistant (ou alexa)
- avec text ingredient
- What do you want to say? : "Je sors pour $" (sans les " ")
- What do you want the Assistant to say in response? "D'accord, je génère l'attestation de sortie pour $ . Vous recevrez sous peu un e-mail. Bonne journée" (sans les " ")
- langue : Francais
- create trigger
- clique sur that : rechercher webhook -> "make a web request"
- dans url copier l'url api récupéré
- create action -> finish
- et voilà
