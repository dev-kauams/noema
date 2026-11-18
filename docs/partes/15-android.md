## Aplicativo Android (APK)

**Estado honesto:** não consegui gerar o arquivo `.apk` neste ambiente (não há Android SDK nem internet para baixar as dependências). O que entreguei é o projeto **pronto para empacotar**, com a ponte para Android configurada. O empacotamento usa o **Capacitor**, que coloca o `dist/noema.html` dentro de um WebView e dá acesso a recursos nativos (login Google, compartilhar arquivos).

### Pré-requisitos no seu computador

Node.js, JDK 17 e Android Studio (com o Android SDK). A primeira compilação baixa dependências do Gradle (internet).

### Passo a passo

```bash
npm install                 # instala o Capacitor e os plugins (package.json)
npm run android:prepare     # build + copia para dist-web/index.html
npm run android:add         # cria a pasta android/ (só na 1ª vez)
npm run android:sync        # leva o app e os plugins para o projeto Android
npm run android:open        # abre no Android Studio (Build > Build APK)  ou:
npm run android:apk         # gera android/app/build/outputs/apk/debug/app-debug.apk
```

Os números de versão em `package.json` (`^7`) são os mais recentes que eu conhecia; se o `npm install` reclamar de versões incompatíveis, alinhe os pacotes `@capacitor/*` e `@capacitor-firebase/authentication` na mesma versão principal.

### Login Google no Android

1. No Firebase, em *Configurações do projeto → Seus apps*, adicione um app **Android** com o pacote `com.devkauams.noema` e a **impressão digital SHA-1** da sua chave (`./gradlew signingReport` na pasta `android/`).
2. Baixe o **`google-services.json`** e coloque em `android/app/`. O template do Capacitor aplica o plugin `com.google.gms.google-services` quando esse arquivo existe; se o seu projeto não aplicar, siga o README do plugin `@capacitor-firebase/authentication`.
3. Em *Authentication* mantenha o provedor **Google** ativado. Na `noema.config.json` basta `apiKey` e `projectId`; o ID de cliente Web não é necessário no Android (o `google-services.json` o traz).
4. `capacitor.config.json` já usa `skipNativeAuth: true`: o plugin só devolve o token do Google e o NOEMA faz a troca por REST (`signInWithIdp`), igual ao navegador.

### O que muda no app dentro do Android

- **Exportar nota (PDF, TXT, JSON, Markdown):** o WebView não baixa arquivos como o navegador. No Android o app grava o arquivo na pasta de cache (`@capacitor/filesystem`) e abre o **menu de compartilhar** (`@capacitor/share`), de onde você salva no Drive, envia por WhatsApp etc.
- **Dados:** IndexedDB e `localStorage` do WebView, em origem `https://localhost`. Funcionam offline e sincronizam quando a internet volta.
- **Publicar na Play Store** exige assinar um APK/AAB de *release* (chave própria) e seguir as regras do Google para o botão de login; usei um botão de texto no estilo do app.

### Alternativa sem Android Studio

Hospedar `dist/noema.html` em HTTPS (por exemplo GitHub Pages), instalar como **PWA** pelo navegador do celular, ou gerar o APK pelo PWABuilder a partir do endereço. Nesse caminho o login Google funciona pelo popup do navegador (exige o ID de cliente Web).

### Não testado

Nada do caminho Android foi executado aqui: o Capacitor, o plugin de login, o compartilhamento de arquivos e a compilação. O código do app em si (login por REST, sincronização, exportação) foi testado no navegador com um servidor Firebase simulado.

<!-- codigo: capacitor.config.json -->

<!-- codigo: scripts/android.mjs -->
