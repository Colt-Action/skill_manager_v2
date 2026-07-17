import type { Sprache } from "./sprachen";

// Übersetzungen der App-Oberfläche (Menüs, Buttons, Beschriftungen).
// KI-generiert als solider Startpunkt - bei Fachbegriffen in selteneren
// Sprachen empfiehlt sich irgendwann ein Gegencheck durch Muttersprachler.
// Neue Bereiche werden schrittweise ergänzt (Phase 14b/14c/14d).
export const WOERTERBUCH: Record<string, Record<Sprache, string>> = {
  "nav.dashboard": {
    de: "Dashboard", en: "Dashboard", es: "Panel", pt: "Painel", sv: "Instrumentpanel",
    fi: "Kojelauta", zh: "仪表盘", ja: "ダッシュボード", id: "Dasbor", ms: "Papan Pemuka", af: "Paneelbord",
  },
  "nav.videothek": {
    de: "Videothek", en: "Video Library", es: "Videoteca", pt: "Videoteca", sv: "Videobibliotek",
    fi: "Videokirjasto", zh: "视频库", ja: "ビデオライブラリ", id: "Perpustakaan Video", ms: "Perpustakaan Video", af: "Videobiblioteek",
  },
  "nav.referenzvideos": {
    de: "Referenzvideos", en: "Reference Videos", es: "Videos de referencia", pt: "Vídeos de referência", sv: "Referensvideor",
    fi: "Referenssivideot", zh: "参考视频", ja: "リファレンス動画", id: "Video Referensi", ms: "Video Rujukan", af: "Verwysingsvideo's",
  },
  "nav.hochladen": {
    de: "Hochladen", en: "Upload", es: "Subir", pt: "Enviar", sv: "Ladda upp",
    fi: "Lataa", zh: "上传", ja: "アップロード", id: "Unggah", ms: "Muat Naik", af: "Oplaai",
  },
  "nav.merkliste": {
    de: "Merkliste", en: "Watchlist", es: "Favoritos", pt: "Favoritos", sv: "Sparade",
    fi: "Suosikit", zh: "收藏夹", ja: "お気に入り", id: "Daftar Simpan", ms: "Senarai Simpan", af: "Gunstelinge",
  },
  "nav.teilMelden": {
    de: "Teil melden", en: "Report a part", es: "Reportar pieza", pt: "Reportar peça", sv: "Anmäl del",
    fi: "Ilmoita osa", zh: "报告零件", ja: "部品を報告", id: "Laporkan Komponen", ms: "Laporkan Bahagian", af: "Rapporteer onderdeel",
  },
  "nav.lernpfade": {
    de: "Lernpfade", en: "Learning Paths", es: "Rutas de aprendizaje", pt: "Trilhas de aprendizagem", sv: "Utbildningsspår",
    fi: "Oppimispolut", zh: "学习路径", ja: "学習パス", id: "Jalur Pembelajaran", ms: "Laluan Pembelajaran", af: "Leerpaaie",
  },
  "nav.verwaltung": {
    de: "Verwaltung", en: "Admin", es: "Administración", pt: "Administração", sv: "Administration",
    fi: "Hallinta", zh: "管理", ja: "管理", id: "Administrasi", ms: "Pentadbiran", af: "Administrasie",
  },
  "nav.logout": {
    de: "Logout", en: "Log out", es: "Cerrar sesión", pt: "Sair", sv: "Logga ut",
    fi: "Kirjaudu ulos", zh: "退出登录", ja: "ログアウト", id: "Keluar", ms: "Log Keluar", af: "Teken uit",
  },
  "nav.suche": {
    de: "Suche …", en: "Search …", es: "Buscar …", pt: "Pesquisar …", sv: "Sök …",
    fi: "Haku …", zh: "搜索…", ja: "検索…", id: "Cari …", ms: "Cari …", af: "Soek …",
  },
  "nav.mehr": {
    de: "Mehr", en: "More", es: "Más", pt: "Mais", sv: "Mer",
    fi: "Lisää", zh: "更多", ja: "その他", id: "Lainnya", ms: "Lagi", af: "Meer",
  },
  "nav.start": {
    de: "Start", en: "Home", es: "Inicio", pt: "Início", sv: "Start",
    fi: "Etusivu", zh: "首页", ja: "ホーム", id: "Beranda", ms: "Utama", af: "Tuis",
  },
  "nav.meinProfil": {
    de: "Mein Profil", en: "My Profile", es: "Mi perfil", pt: "Meu perfil", sv: "Min profil",
    fi: "Oma profiili", zh: "我的资料", ja: "マイプロフィール", id: "Profil Saya", ms: "Profil Saya", af: "My profiel",
  },
  "nav.menuOeffnen": {
    de: "Menü öffnen", en: "Open menu", es: "Abrir menú", pt: "Abrir menu", sv: "Öppna meny",
    fi: "Avaa valikko", zh: "打开菜单", ja: "メニューを開く", id: "Buka menu", ms: "Buka menu", af: "Open kieslys",
  },
  "nav.menuSchliessen": {
    de: "Menü schließen", en: "Close menu", es: "Cerrar menú", pt: "Fechar menu", sv: "Stäng meny",
    fi: "Sulje valikko", zh: "关闭菜单", ja: "メニューを閉じる", id: "Tutup menu", ms: "Tutup menu", af: "Sluit kieslys",
  },
  "nav.sprache": {
    de: "Sprache", en: "Language", es: "Idioma", pt: "Idioma", sv: "Språk",
    fi: "Kieli", zh: "语言", ja: "言語", id: "Bahasa", ms: "Bahasa", af: "Taal",
  },

  "admin.pruefungFreigabe": {
    de: "Prüfung & Freigabe", en: "Review & Approval", es: "Revisión y aprobación", pt: "Revisão e aprovação", sv: "Granskning & godkännande",
    fi: "Tarkistus ja hyväksyntä", zh: "审核与发布", ja: "審査と承認", id: "Peninjauan & Persetujuan", ms: "Semakan & Kelulusan", af: "Hersiening & goedkeuring",
  },
  "admin.loeschanfragen": {
    de: "Löschanfragen", en: "Deletion Requests", es: "Solicitudes de eliminación", pt: "Solicitações de exclusão", sv: "Raderingsförfrågningar",
    fi: "Poistopyynnöt", zh: "删除请求", ja: "削除リクエスト", id: "Permintaan Penghapusan", ms: "Permintaan Pemadaman", af: "Skrapversoeke",
  },
  "admin.teilMeldungen": {
    de: "Teil-Meldungen", en: "Part Reports", es: "Reportes de piezas", pt: "Relatórios de peças", sv: "Delrapporter",
    fi: "Osailmoitukset", zh: "零件报告", ja: "部品レポート", id: "Laporan Komponen", ms: "Laporan Bahagian", af: "Onderdeelverslae",
  },
  "admin.kategorienTeile": {
    de: "Kategorien & Teile", en: "Categories & Parts", es: "Categorías y piezas", pt: "Categorias e peças", sv: "Kategorier & delar",
    fi: "Kategoriat ja osat", zh: "分类与零件", ja: "カテゴリーと部品", id: "Kategori & Komponen", ms: "Kategori & Bahagian", af: "Kategorieë & onderdele",
  },
  "admin.qrCodes": {
    de: "QR-Codes", en: "QR Codes", es: "Códigos QR", pt: "Códigos QR", sv: "QR-koder",
    fi: "QR-koodit", zh: "二维码", ja: "QRコード", id: "Kode QR", ms: "Kod QR", af: "QR-kodes",
  },
  "admin.analytics": {
    de: "Analytics", en: "Analytics", es: "Estadísticas", pt: "Estatísticas", sv: "Statistik",
    fi: "Tilastot", zh: "数据分析", ja: "分析", id: "Analitik", ms: "Analitik", af: "Analise",
  },
  "admin.nutzerverwaltung": {
    de: "Nutzerverwaltung", en: "User Management", es: "Gestión de usuarios", pt: "Gestão de usuários", sv: "Användarhantering",
    fi: "Käyttäjähallinta", zh: "用户管理", ja: "ユーザー管理", id: "Manajemen Pengguna", ms: "Pengurusan Pengguna", af: "Gebruikerbestuur",
  },

  "login.eyebrow": {
    de: "Werkstatt-Zugang", en: "Workshop Access", es: "Acceso al taller", pt: "Acesso à oficina", sv: "Verkstadstillgång",
    fi: "Työpajan käyttöoikeus", zh: "车间入口", ja: "ワークショップアクセス", id: "Akses Bengkel", ms: "Akses Bengkel", af: "Werkswinkeltoegang",
  },
  "login.titel": {
    de: "Skill Manager", en: "Skill Manager", es: "Skill Manager", pt: "Skill Manager", sv: "Skill Manager",
    fi: "Skill Manager", zh: "Skill Manager", ja: "Skill Manager", id: "Skill Manager", ms: "Skill Manager", af: "Skill Manager",
  },
  "login.untertitel": {
    de: "Erklärvideos zu Maschinenteilen – schnell finden, schnell verstehen.",
    en: "Explainer videos for machine parts – find fast, understand fast.",
    es: "Videos explicativos de piezas de máquinas: encuentra y comprende rápido.",
    pt: "Vídeos explicativos de peças de máquinas – encontre rápido, entenda rápido.",
    sv: "Instruktionsvideor för maskindelar – hitta snabbt, förstå snabbt.",
    fi: "Konepäivittäisten osien selitysvideot – löydä nopeasti, ymmärrä nopeasti.",
    zh: "机器零件讲解视频——快速查找，快速理解。",
    ja: "機械部品の説明動画 – すぐ見つけて、すぐ理解できる。",
    id: "Video penjelasan suku cadang mesin – temukan cepat, pahami cepat.",
    ms: "Video penerangan alat ganti mesin – cari pantas, faham pantas.",
    af: "Verduidelikingsvideo's vir masjienonderdele – vind vinnig, verstaan vinnig.",
  },
  "login.tabLogin": {
    de: "Login", en: "Log in", es: "Acceder", pt: "Entrar", sv: "Logga in",
    fi: "Kirjaudu", zh: "登录", ja: "ログイン", id: "Masuk", ms: "Log Masuk", af: "Teken in",
  },
  "login.tabRegistrieren": {
    de: "Registrieren", en: "Register", es: "Registrarse", pt: "Registrar", sv: "Registrera",
    fi: "Rekisteröidy", zh: "注册", ja: "登録", id: "Daftar", ms: "Daftar", af: "Registreer",
  },
  "login.labelEmail": {
    de: "E-Mail", en: "Email", es: "Correo electrónico", pt: "E-mail", sv: "E-post",
    fi: "Sähköposti", zh: "电子邮箱", ja: "メールアドレス", id: "Email", ms: "E-mel", af: "E-pos",
  },
  "login.labelPasswort": {
    de: "Passwort", en: "Password", es: "Contraseña", pt: "Senha", sv: "Lösenord",
    fi: "Salasana", zh: "密码", ja: "パスワード", id: "Kata Sandi", ms: "Kata Laluan", af: "Wagwoord",
  },
  "login.buttonEinloggen": {
    de: "Einloggen", en: "Log in", es: "Iniciar sesión", pt: "Entrar", sv: "Logga in",
    fi: "Kirjaudu sisään", zh: "登录", ja: "ログイン", id: "Masuk", ms: "Log Masuk", af: "Teken in",
  },
  "login.buttonEinloggenLaeuft": {
    de: "Einloggen…", en: "Logging in…", es: "Iniciando sesión…", pt: "Entrando…", sv: "Loggar in…",
    fi: "Kirjaudutaan…", zh: "登录中…", ja: "ログイン中…", id: "Sedang masuk…", ms: "Log masuk…", af: "Teken in…",
  },
  "login.labelName": {
    de: "Name", en: "Name", es: "Nombre", pt: "Nome", sv: "Namn",
    fi: "Nimi", zh: "姓名", ja: "名前", id: "Nama", ms: "Nama", af: "Naam",
  },
  "login.passwortHinweis": {
    de: "mind. 6 Zeichen", en: "at least 6 characters", es: "mín. 6 caracteres", pt: "mín. 6 caracteres", sv: "minst 6 tecken",
    fi: "väh. 6 merkkiä", zh: "至少6个字符", ja: "6文字以上", id: "min. 6 karakter", ms: "min. 6 aksara", af: "min. 6 karakters",
  },
  "login.labelZugangscode": {
    de: "Zugangscode", en: "Access Code", es: "Código de acceso", pt: "Código de acesso", sv: "Åtkomstkod",
    fi: "Pääsykoodi", zh: "访问码", ja: "アクセスコード", id: "Kode Akses", ms: "Kod Akses", af: "Toegangskode",
  },
  "login.zugangscodeHinweis": {
    de: "Frag deinen Admin nach dem Firmen-Zugangscode",
    en: "Ask your admin for the company access code",
    es: "Pide a tu administrador el código de acceso de la empresa",
    pt: "Peça ao seu admin o código de acesso da empresa",
    sv: "Fråga din admin efter företagets åtkomstkod",
    fi: "Kysy pääkäyttäjältä yrityksen pääsykoodi",
    zh: "向管理员索取公司访问码",
    ja: "会社のアクセスコードを管理者に確認してください",
    id: "Tanyakan kode akses perusahaan kepada admin Anda",
    ms: "Tanya admin anda kod akses syarikat",
    af: "Vra jou admin vir die maatskappy se toegangskode",
  },
  "login.rolleHinweis": {
    de: "Neue Konten starten automatisch mit der Rolle „Techniker“.",
    en: "New accounts automatically start with the \"Technician\" role.",
    es: "Las cuentas nuevas comienzan automáticamente con el rol \"Técnico\".",
    pt: "Novas contas começam automaticamente com a função \"Técnico\".",
    sv: "Nya konton startar automatiskt med rollen \"Tekniker\".",
    fi: "Uudet tilit alkavat automaattisesti roolilla \"Teknikko\".",
    zh: "新账户将自动获得“技术员”角色。",
    ja: "新規アカウントは自動的に「技術者」の役割で開始されます。",
    id: "Akun baru otomatis dimulai dengan peran \"Teknisi\".",
    ms: "Akaun baharu bermula secara automatik dengan peranan \"Juruteknik\".",
    af: "Nuwe rekeninge begin outomaties met die rol \"Tegnikus\".",
  },
  "login.buttonRegistrieren": {
    de: "Konto erstellen", en: "Create account", es: "Crear cuenta", pt: "Criar conta", sv: "Skapa konto",
    fi: "Luo tili", zh: "创建账户", ja: "アカウントを作成", id: "Buat akun", ms: "Cipta akaun", af: "Skep rekening",
  },
  "login.buttonRegistrierenLaeuft": {
    de: "Registrieren…", en: "Registering…", es: "Registrando…", pt: "Registrando…", sv: "Registrerar…",
    fi: "Rekisteröidytään…", zh: "注册中…", ja: "登録中…", id: "Mendaftar…", ms: "Mendaftar…", af: "Registreer…",
  },
  "login.deaktiviertHinweis": {
    de: "Dieses Konto wurde deaktiviert. Wende dich an deinen Admin.",
    en: "This account has been deactivated. Please contact your admin.",
    es: "Esta cuenta ha sido desactivada. Contacta a tu administrador.",
    pt: "Esta conta foi desativada. Entre em contato com seu admin.",
    sv: "Det här kontot har inaktiverats. Kontakta din admin.",
    fi: "Tämä tili on poistettu käytöstä. Ota yhteyttä pääkäyttäjään.",
    zh: "此账户已被停用，请联系管理员。",
    ja: "このアカウントは無効化されています。管理者にお問い合わせください。",
    id: "Akun ini telah dinonaktifkan. Hubungi admin Anda.",
    ms: "Akaun ini telah dinyahaktifkan. Hubungi admin anda.",
    af: "Hierdie rekening is gedeaktiveer. Kontak jou admin.",
  },

  "dashboard.eyebrow": {
    de: "Werkstatt-Konsole", en: "Workshop Console", es: "Consola del taller", pt: "Console da oficina", sv: "Verkstadskonsol",
    fi: "Työpajakonsoli", zh: "车间控制台", ja: "ワークショップコンソール", id: "Konsol Bengkel", ms: "Konsol Bengkel", af: "Werkswinkelkonsole",
  },
  "dashboard.willkommen": {
    de: "Willkommen zurück, {name}", en: "Welcome back, {name}", es: "Bienvenido de nuevo, {name}", pt: "Bem-vindo de volta, {name}", sv: "Välkommen tillbaka, {name}",
    fi: "Tervetuloa takaisin, {name}", zh: "欢迎回来，{name}", ja: "おかえりなさい、{name}さん", id: "Selamat datang kembali, {name}", ms: "Selamat kembali, {name}", af: "Welkom terug, {name}",
  },
  "dashboard.untertitel": {
    de: "Hier ist dein Überblick – oder spring direkt in die Video-Bibliothek.",
    en: "Here's your overview – or jump straight into the video library.",
    es: "Aquí tienes tu resumen, o ve directamente a la videoteca.",
    pt: "Aqui está seu resumo – ou vá direto para a videoteca.",
    sv: "Här är din översikt – eller hoppa direkt till videobiblioteket.",
    fi: "Tässä on yleiskatsauksesi – tai siirry suoraan videokirjastoon.",
    zh: "这是你的概览——或直接前往视频库。",
    ja: "こちらが概要です – またはすぐにビデオライブラリへ移動できます。",
    id: "Ini ringkasan Anda – atau langsung ke perpustakaan video.",
    ms: "Ini gambaran keseluruhan anda – atau terus ke perpustakaan video.",
    af: "Hier is jou oorsig – of spring direk na die videobiblioteek.",
  },
  "dashboard.videoBibliothek": {
    de: "Video-Bibliothek", en: "Video Library", es: "Videoteca", pt: "Videoteca", sv: "Videobibliotek",
    fi: "Videokirjasto", zh: "视频库", ja: "ビデオライブラリ", id: "Perpustakaan Video", ms: "Perpustakaan Video", af: "Videobiblioteek",
  },
  "dashboard.videoHochladen": {
    de: "Video hochladen", en: "Upload video", es: "Subir video", pt: "Enviar vídeo", sv: "Ladda upp video",
    fi: "Lataa video", zh: "上传视频", ja: "動画をアップロード", id: "Unggah video", ms: "Muat naik video", af: "Laai video op",
  },
  "dashboard.teilNichtGefunden": {
    de: "Teil nicht gefunden?", en: "Part not found?", es: "¿No encuentras la pieza?", pt: "Peça não encontrada?", sv: "Hittar du inte delen?",
    fi: "Etkö löydä osaa?", zh: "找不到零件？", ja: "部品が見つかりませんか？", id: "Komponen tidak ditemukan?", ms: "Bahagian tidak dijumpai?", af: "Onderdeel nie gevind nie?",
  },
  "dashboard.verwaltungOffenePunkte": {
    de: "Verwaltung – offene Punkte", en: "Admin – open items", es: "Administración – pendientes", pt: "Administração – pendências", sv: "Administration – öppna punkter",
    fi: "Hallinta – avoimet kohdat", zh: "管理 — 待处理事项", ja: "管理 – 未処理項目", id: "Administrasi – hal tertunda", ms: "Pentadbiran – perkara belum selesai", af: "Administrasie – oop punte",
  },
  "dashboard.videosInPruefung": {
    de: "Videos in Prüfung", en: "Videos in review", es: "Videos en revisión", pt: "Vídeos em revisão", sv: "Videor under granskning",
    fi: "Tarkistettavat videot", zh: "待审核视频", ja: "審査中の動画", id: "Video dalam peninjauan", ms: "Video dalam semakan", af: "Video's onder hersiening",
  },
  "dashboard.offeneLoeschanfragen": {
    de: "Offene Löschanfragen", en: "Open deletion requests", es: "Solicitudes de eliminación pendientes", pt: "Solicitações de exclusão pendentes", sv: "Öppna raderingsförfrågningar",
    fi: "Avoimet poistopyynnöt", zh: "待处理的删除请求", ja: "未処理の削除リクエスト", id: "Permintaan penghapusan tertunda", ms: "Permintaan pemadaman belum selesai", af: "Oop skrapversoeke",
  },
  "dashboard.teilMeldungen": {
    de: "Teil-Meldungen", en: "Part reports", es: "Reportes de piezas", pt: "Relatórios de peças", sv: "Delrapporter",
    fi: "Osailmoitukset", zh: "零件报告", ja: "部品レポート", id: "Laporan komponen", ms: "Laporan bahagian", af: "Onderdeelverslae",
  },
  "dashboard.zuletztAngesehen": {
    de: "Zuletzt angesehen", en: "Recently viewed", es: "Vistos recientemente", pt: "Vistos recentemente", sv: "Nyligen visade",
    fi: "Äskettäin katsotut", zh: "最近观看", ja: "最近視聴した動画", id: "Baru dilihat", ms: "Baru dilihat", af: "Onlangs bekyk",
  },
  "dashboard.neuInBibliothek": {
    de: "Neu in der Bibliothek", en: "New in the library", es: "Nuevo en la videoteca", pt: "Novo na videoteca", sv: "Nytt i biblioteket",
    fi: "Uutta kirjastossa", zh: "库中新增", ja: "ライブラリの新着", id: "Baru di perpustakaan", ms: "Baharu dalam perpustakaan", af: "Nuut in die biblioteek",
  },
  "dashboard.alleAnsehen": {
    de: "Alle ansehen →", en: "View all →", es: "Ver todo →", pt: "Ver tudo →", sv: "Visa alla →",
    fi: "Näytä kaikki →", zh: "查看全部 →", ja: "すべて表示 →", id: "Lihat semua →", ms: "Lihat semua →", af: "Bekyk alles →",
  },
  "dashboard.keineVeroeffentlicht": {
    de: "Noch keine veröffentlichten Videos.", en: "No published videos yet.", es: "Aún no hay videos publicados.", pt: "Ainda não há vídeos publicados.", sv: "Inga publicerade videor ännu.",
    fi: "Ei vielä julkaistuja videoita.", zh: "尚无已发布的视频。", ja: "公開された動画はまだありません。", id: "Belum ada video yang dipublikasikan.", ms: "Belum ada video diterbitkan.", af: "Nog geen gepubliseerde video's nie.",
  },
  "dashboard.topBeitragende": {
    de: "Top-Beitragende", en: "Top Contributors", es: "Principales colaboradores", pt: "Principais colaboradores", sv: "Toppbidragsgivare",
    fi: "Parhaat osallistujat", zh: "顶尖贡献者", ja: "トップ貢献者", id: "Kontributor teratas", ms: "Penyumbang teratas", af: "Top-bydraers",
  },
  "dashboard.topBeitragendeUntertitel": {
    de: "Technikerinnen und Techniker mit den meisten veröffentlichten Videos.",
    en: "Technicians with the most published videos.",
    es: "Técnicos con más videos publicados.",
    pt: "Técnicos com mais vídeos publicados.",
    sv: "Tekniker med flest publicerade videor.",
    fi: "Teknikot, joilla on eniten julkaistuja videoita.",
    zh: "发布视频最多的技术人员。",
    ja: "公開動画数が最も多い技術者。",
    id: "Teknisi dengan video terpublikasi terbanyak.",
    ms: "Juruteknik dengan video diterbitkan paling banyak.",
    af: "Tegnici met die meeste gepubliseerde video's.",
  },
  "dashboard.deineMerkliste": {
    de: "Deine Merkliste", en: "Your Watchlist", es: "Tus favoritos", pt: "Seus favoritos", sv: "Dina sparade",
    fi: "Suosikkisi", zh: "你的收藏夹", ja: "あなたのお気に入り", id: "Daftar simpan Anda", ms: "Senarai simpan anda", af: "Jou gunstelinge",
  },

  "videothek.eyebrow": {
    de: "Werkstatt-Konsole", en: "Workshop Console", es: "Consola del taller", pt: "Console da oficina", sv: "Verkstadskonsol",
    fi: "Työpajakonsoli", zh: "车间控制台", ja: "ワークショップコンソール", id: "Konsol Bengkel", ms: "Konsol Bengkel", af: "Werkswinkelkonsole",
  },
  "videothek.titel": {
    de: "Video-Bibliothek", en: "Video Library", es: "Videoteca", pt: "Videoteca", sv: "Videobibliotek",
    fi: "Videokirjasto", zh: "视频库", ja: "ビデオライブラリ", id: "Perpustakaan Video", ms: "Perpustakaan Video", af: "Videobiblioteek",
  },
  "videothek.untertitel": {
    de: "Finde kurze Erklärvideos zu Maschinenteilen – filtere oder suche direkt los.",
    en: "Find short explainer videos for machine parts – filter or search right away.",
    es: "Encuentra videos explicativos breves de piezas de máquinas – filtra o busca directamente.",
    pt: "Encontre vídeos explicativos curtos de peças de máquinas – filtre ou pesquise agora.",
    sv: "Hitta korta instruktionsvideor för maskindelar – filtrera eller sök direkt.",
    fi: "Löydä lyhyitä selitysvideoita konepäivittäisistä osista – suodata tai hae heti.",
    zh: "查找机器零件的简短讲解视频——立即筛选或搜索。",
    ja: "機械部品の短い説明動画を見つけましょう – すぐにフィルターまたは検索できます。",
    id: "Temukan video penjelasan singkat suku cadang mesin – filter atau cari langsung.",
    ms: "Cari video penerangan ringkas alat ganti mesin – tapis atau cari terus.",
    af: "Vind kort verduidelikingsvideo's vir masjienonderdele – filter of soek dadelik.",
  },
  "videothek.teil": {
    de: "Teil", en: "Part", es: "Pieza", pt: "Peça", sv: "Del",
    fi: "Osa", zh: "零件", ja: "部品", id: "Komponen", ms: "Bahagian", af: "Onderdeel",
  },
  "videothek.alle": {
    de: "Alle", en: "All", es: "Todos", pt: "Todos", sv: "Alla",
    fi: "Kaikki", zh: "全部", ja: "すべて", id: "Semua", ms: "Semua", af: "Alle",
  },
  "videothek.suche": {
    de: "Suche", en: "Search", es: "Buscar", pt: "Pesquisar", sv: "Sök",
    fi: "Haku", zh: "搜索", ja: "検索", id: "Cari", ms: "Cari", af: "Soek",
  },
  "videothek.suchePlatzhalter": {
    de: "Titel, Teilenummer, Tag …", en: "Title, part number, tag …", es: "Título, número de pieza, etiqueta …", pt: "Título, número da peça, tag …", sv: "Titel, artikelnummer, tagg …",
    fi: "Otsikko, osanumero, tunniste …", zh: "标题、零件号、标签…", ja: "タイトル、部品番号、タグ…", id: "Judul, nomor komponen, tag …", ms: "Tajuk, nombor bahagian, tag …", af: "Titel, onderdeelnommer, etiket …",
  },
  "videothek.keineTreffer": {
    de: "Keine Videos gefunden. Versuch einen anderen Suchbegriff oder Filter.",
    en: "No videos found. Try a different search term or filter.",
    es: "No se encontraron videos. Prueba con otro término de búsqueda o filtro.",
    pt: "Nenhum vídeo encontrado. Tente outro termo de busca ou filtro.",
    sv: "Inga videor hittades. Prova en annan sökterm eller filter.",
    fi: "Videoita ei löytynyt. Kokeile toista hakusanaa tai suodatinta.",
    zh: "未找到视频。请尝试其他搜索词或筛选条件。",
    ja: "動画が見つかりませんでした。別のキーワードやフィルターをお試しください。",
    id: "Tidak ada video ditemukan. Coba kata kunci atau filter lain.",
    ms: "Tiada video dijumpai. Cuba kata kunci atau tapisan lain.",
    af: "Geen video's gevind nie. Probeer 'n ander soekterm of filter.",
  },
  "videothek.mehrAnzeigen": {
    de: "Mehr anzeigen ({anzahl} weitere)", en: "Show more ({anzahl} more)", es: "Mostrar más ({anzahl} más)", pt: "Mostrar mais ({anzahl} a mais)", sv: "Visa fler ({anzahl} till)",
    fi: "Näytä lisää ({anzahl} lisää)", zh: "显示更多（还有{anzahl}个）", ja: "もっと見る（あと{anzahl}件）", id: "Tampilkan lagi ({anzahl} lagi)", ms: "Tunjuk lagi ({anzahl} lagi)", af: "Wys meer ({anzahl} meer)",
  },

  "favoriten.eyebrow": {
    de: "Persönliche Ablage", en: "Personal Collection", es: "Colección personal", pt: "Coleção pessoal", sv: "Personlig samling",
    fi: "Henkilökohtainen kokoelma", zh: "个人收藏", ja: "個人コレクション", id: "Koleksi Pribadi", ms: "Koleksi Peribadi", af: "Persoonlike versameling",
  },
  "favoriten.titel": {
    de: "Meine Merkliste", en: "My Watchlist", es: "Mis favoritos", pt: "Meus favoritos", sv: "Mina sparade",
    fi: "Suosikkini", zh: "我的收藏夹", ja: "マイお気に入り", id: "Daftar Simpan Saya", ms: "Senarai Simpan Saya", af: "My gunstelinge",
  },
  "favoriten.untertitel": {
    de: "Videos, die du dir für später gemerkt hast.", en: "Videos you've saved for later.", es: "Videos que has guardado para más tarde.", pt: "Vídeos que você salvou para depois.", sv: "Videor du sparat till senare.",
    fi: "Videot, jotka olet tallentanut myöhempää varten.", zh: "你保存以备稍后观看的视频。", ja: "後で見るために保存した動画。", id: "Video yang Anda simpan untuk nanti.", ms: "Video yang anda simpan untuk kemudian.", af: "Video's wat jy vir later gestoor het.",
  },
  "favoriten.leer": {
    de: "Noch nichts gemerkt. Klick auf den Stern bei einem Video, um es hier zu sammeln.",
    en: "Nothing saved yet. Click the star on a video to collect it here.",
    es: "Aún no has guardado nada. Haz clic en la estrella de un video para agregarlo aquí.",
    pt: "Ainda nada salvo. Clique na estrela de um vídeo para reuni-lo aqui.",
    sv: "Inget sparat än. Klicka på stjärnan vid en video för att samla den här.",
    fi: "Ei vielä mitään tallennettuna. Napsauta videon tähteä kerätäksesi sen tänne.",
    zh: "还没有收藏任何内容。点击视频上的星标即可收藏到这里。",
    ja: "まだ保存されていません。動画の星マークをクリックしてここに集めましょう。",
    id: "Belum ada yang disimpan. Klik bintang pada video untuk mengumpulkannya di sini.",
    ms: "Belum ada yang disimpan. Klik bintang pada video untuk kumpulkannya di sini.",
    af: "Nog niks gestoor nie. Klik op die ster by 'n video om dit hier te versamel.",
  },

  "teilMelden.eyebrow": {
    de: "Meldung", en: "Report", es: "Reporte", pt: "Relatório", sv: "Anmälan",
    fi: "Ilmoitus", zh: "报告", ja: "報告", id: "Laporan", ms: "Laporan", af: "Verslag",
  },
  "teilMelden.titel": {
    de: "Teil nicht gefunden?", en: "Part not found?", es: "¿No encuentras la pieza?", pt: "Peça não encontrada?", sv: "Hittar du inte delen?",
    fi: "Etkö löydä osaa?", zh: "找不到零件？", ja: "部品が見つかりませんか？", id: "Komponen tidak ditemukan?", ms: "Bahagian tidak dijumpai?", af: "Onderdeel nie gevind nie?",
  },
  "teilMelden.untertitel": {
    de: "Beschreib kurz, welches Teil du gesucht hast und nicht gefunden hast. Ein Admin schaut sich das an und ergänzt die Kategorien/Teile bei Bedarf.",
    en: "Briefly describe which part you were looking for and couldn't find. An admin will review this and add categories/parts if needed.",
    es: "Describe brevemente qué pieza buscabas y no encontraste. Un administrador lo revisará y completará las categorías/piezas si es necesario.",
    pt: "Descreva brevemente qual peça você procurava e não encontrou. Um admin vai revisar e completar as categorias/peças se necessário.",
    sv: "Beskriv kort vilken del du letade efter men inte hittade. En admin granskar det och kompletterar kategorier/delar vid behov.",
    fi: "Kuvaile lyhyesti, mitä osaa etsit etkä löytänyt. Pääkäyttäjä tarkistaa tämän ja täydentää kategorioita/osia tarvittaessa.",
    zh: "简要描述你要找但没找到的零件。管理员会查看并在需要时补充分类/零件。",
    ja: "見つからなかった部品について簡単に説明してください。管理者が確認し、必要に応じてカテゴリー・部品を追加します。",
    id: "Jelaskan singkat komponen apa yang Anda cari dan tidak ditemukan. Admin akan meninjau dan melengkapi kategori/komponen jika diperlukan.",
    ms: "Terangkan secara ringkas bahagian yang anda cari tetapi tidak dijumpai. Admin akan menyemak dan melengkapkan kategori/bahagian jika perlu.",
    af: "Beskryf kortliks watter onderdeel jy gesoek het en nie gevind het nie. 'n Admin sal dit nagaan en kategorieë/onderdele indien nodig byvoeg.",
  },
  "teilMelden.platzhalter": {
    de: "z. B. Ich habe die Kategorie 'HD-PU' gesucht, aber kein passendes Video gefunden für Teilenummer XY...",
    en: "e.g. I looked in category 'HD-PU' but couldn't find a matching video for part number XY...",
    es: "p. ej. Busqué en la categoría 'HD-PU' pero no encontré un video adecuado para el número de pieza XY...",
    pt: "ex.: Procurei na categoria 'HD-PU' mas não encontrei um vídeo correspondente para a peça XY...",
    sv: "t.ex. Jag letade i kategorin 'HD-PU' men hittade ingen matchande video för artikelnummer XY...",
    fi: "esim. Etsin kategoriasta 'HD-PU', mutta en löytänyt sopivaa videota osanumerolle XY...",
    zh: "例如：我在“HD-PU”分类中查找，但没有找到对应零件号XY的视频……",
    ja: "例：カテゴリー「HD-PU」で探しましたが、部品番号XYに合う動画が見つかりませんでした…",
    id: "contoh: Saya mencari di kategori 'HD-PU' tapi tidak menemukan video yang cocok untuk nomor komponen XY...",
    ms: "cth: Saya mencari dalam kategori 'HD-PU' tetapi tidak menjumpai video yang sepadan untuk nombor bahagian XY...",
    af: "bv. Ek het in kategorie 'HD-PU' gesoek maar geen passende video vir onderdeelnommer XY gevind nie...",
  },
  "teilMelden.danke": {
    de: "Danke, deine Meldung wurde an die Admins weitergeleitet.", en: "Thanks, your report has been sent to the admins.", es: "Gracias, tu reporte fue enviado a los administradores.", pt: "Obrigado, seu relatório foi enviado aos admins.", sv: "Tack, din anmälan har skickats till administratörerna.",
    fi: "Kiitos, ilmoituksesi on lähetetty pääkäyttäjille.", zh: "谢谢，你的报告已发送给管理员。", ja: "ありがとうございます。報告は管理者に送信されました。", id: "Terima kasih, laporan Anda telah dikirim ke admin.", ms: "Terima kasih, laporan anda telah dihantar kepada admin.", af: "Dankie, jou verslag is aan die admins gestuur.",
  },
  "teilMelden.sendenButton": {
    de: "Meldung senden", en: "Send report", es: "Enviar reporte", pt: "Enviar relatório", sv: "Skicka anmälan",
    fi: "Lähetä ilmoitus", zh: "发送报告", ja: "報告を送信", id: "Kirim laporan", ms: "Hantar laporan", af: "Stuur verslag",
  },
  "teilMelden.sendetLaeuft": {
    de: "Sendet …", en: "Sending …", es: "Enviando …", pt: "Enviando …", sv: "Skickar …",
    fi: "Lähetetään …", zh: "发送中…", ja: "送信中…", id: "Mengirim …", ms: "Menghantar …", af: "Stuur …",
  },
  "teilMelden.fehlerStandard": {
    de: "Fehler beim Senden.", en: "Error sending.", es: "Error al enviar.", pt: "Erro ao enviar.", sv: "Fel vid sändning.",
    fi: "Virhe lähetettäessä.", zh: "发送出错。", ja: "送信エラーが発生しました。", id: "Kesalahan saat mengirim.", ms: "Ralat semasa menghantar.", af: "Fout tydens stuur.",
  },

  "referenzvideos.eyebrow": {
    de: "Für den Vertrieb", en: "For Sales", es: "Para ventas", pt: "Para vendas", sv: "För säljare",
    fi: "Myynnille", zh: "面向销售", ja: "営業向け", id: "Untuk Penjualan", ms: "Untuk Jualan", af: "Vir verkope",
  },
  "referenzvideos.titel": {
    de: "Referenzvideos", en: "Reference Videos", es: "Videos de referencia", pt: "Vídeos de referência", sv: "Referensvideor",
    fi: "Referenssivideot", zh: "参考视频", ja: "リファレンス動画", id: "Video Referensi", ms: "Video Rujukan", af: "Verwysingsvideo's",
  },
  "referenzvideos.untertitel": {
    de: "Zeig Kunden, wie gut HOSCH-Geräte in vergleichbaren Anlagen laufen – filterbar nach Material, Geschwindigkeit, Förderbandbreite und mehr.",
    en: "Show customers how well HOSCH equipment performs in comparable setups – filterable by material, speed, belt width and more.",
    es: "Muestra a los clientes el buen rendimiento de los equipos HOSCH en instalaciones comparables – filtrable por material, velocidad, ancho de cinta y más.",
    pt: "Mostre aos clientes o bom desempenho dos equipamentos HOSCH em instalações comparáveis – filtrável por material, velocidade, largura da correia e mais.",
    sv: "Visa kunder hur bra HOSCH-utrustning fungerar i jämförbara anläggningar – filtrerbart efter material, hastighet, bandbredd och mer.",
    fi: "Näytä asiakkaille, kuinka hyvin HOSCH-laitteet toimivat vastaavissa laitoksissa – suodatettavissa materiaalin, nopeuden, hihnan leveyden ja muun mukaan.",
    zh: "向客户展示HOSCH设备在同类设施中的出色表现——可按材料、速度、皮带宽度等筛选。",
    ja: "類似設備でHOSCH機器がどれほど優れた性能を発揮するかをお客様に示せます – 材料、速度、ベルト幅などでフィルター可能。",
    id: "Tunjukkan kepada pelanggan seberapa baik performa peralatan HOSCH di instalasi serupa – dapat difilter berdasarkan material, kecepatan, lebar sabuk, dan lainnya.",
    ms: "Tunjukkan kepada pelanggan prestasi baik peralatan HOSCH dalam loji setanding – boleh ditapis mengikut bahan, kelajuan, lebar tali sawat dan banyak lagi.",
    af: "Wys kliënte hoe goed HOSCH-toerusting in vergelykbare aanlegte presteer – filtreerbaar volgens materiaal, spoed, bandwydte en meer.",
  },
  "referenzvideos.zusatzfilter": {
    de: "{hersteller}-Zusatzfilter", en: "{hersteller} additional filters", es: "Filtros adicionales de {hersteller}", pt: "Filtros adicionais de {hersteller}", sv: "{hersteller}-tilläggsfilter",
    fi: "{hersteller}-lisäsuodattimet", zh: "{hersteller}附加筛选", ja: "{hersteller}追加フィルター", id: "Filter tambahan {hersteller}", ms: "Penapis tambahan {hersteller}", af: "{hersteller}-bykomende filters",
  },
  "referenzvideos.material": {
    de: "Material", en: "Material", es: "Material", pt: "Material", sv: "Material",
    fi: "Materiaali", zh: "材料", ja: "素材", id: "Material", ms: "Bahan", af: "Materiaal",
  },
  "referenzvideos.foerderbandbreite": {
    de: "Förderbandbreite", en: "Belt Width", es: "Ancho de la cinta", pt: "Largura da correia", sv: "Bandbredd",
    fi: "Hihnan leveys", zh: "输送带宽度", ja: "ベルト幅", id: "Lebar Sabuk", ms: "Lebar Tali Sawat", af: "Bandwydte",
  },
  "referenzvideos.beltConnection": {
    de: "Belt Connection", en: "Belt Connection", es: "Belt Connection", pt: "Belt Connection", sv: "Belt Connection",
    fi: "Belt Connection", zh: "皮带连接方式", ja: "ベルト接続方式", id: "Belt Connection", ms: "Belt Connection", af: "Belt Connection",
  },
  "referenzvideos.runbackReversible": {
    de: "Runback/Reversible", en: "Runback/Reversible", es: "Runback/Reversible", pt: "Runback/Reversible", sv: "Runback/Reversible",
    fi: "Runback/Reversible", zh: "逆转/可逆", ja: "逆走/リバーシブル", id: "Runback/Reversible", ms: "Runback/Reversible", af: "Runback/Reversible",
  },
  "referenzvideos.ja": {
    de: "Ja", en: "Yes", es: "Sí", pt: "Sim", sv: "Ja",
    fi: "Kyllä", zh: "是", ja: "はい", id: "Ya", ms: "Ya", af: "Ja",
  },
  "referenzvideos.nein": {
    de: "Nein", en: "No", es: "No", pt: "Não", sv: "Nej",
    fi: "Ei", zh: "否", ja: "いいえ", id: "Tidak", ms: "Tidak", af: "Nee",
  },
  "referenzvideos.land": {
    de: "Land", en: "Country", es: "País", pt: "País", sv: "Land",
    fi: "Maa", zh: "国家", ja: "国", id: "Negara", ms: "Negara", af: "Land",
  },
  "referenzvideos.landPlatzhalter": {
    de: "z. B. Deutschland", en: "e.g. Germany", es: "p. ej. Alemania", pt: "ex.: Alemanha", sv: "t.ex. Tyskland",
    fi: "esim. Saksa", zh: "例如：德国", ja: "例：ドイツ", id: "contoh: Jerman", ms: "cth: Jerman", af: "bv. Duitsland",
  },
  "referenzvideos.besonderheiten": {
    de: "Besonderheiten", en: "Special Notes", es: "Particularidades", pt: "Particularidades", sv: "Särdrag",
    fi: "Erikoisuudet", zh: "特殊说明", ja: "特記事項", id: "Catatan Khusus", ms: "Catatan Khas", af: "Besonderhede",
  },
  "referenzvideos.besonderheitenPlatzhalter": {
    de: "Freitext-Suche", en: "Free-text search", es: "Búsqueda de texto libre", pt: "Busca de texto livre", sv: "Fritextsökning",
    fi: "Vapaan tekstin haku", zh: "自由文本搜索", ja: "フリーテキスト検索", id: "Pencarian teks bebas", ms: "Carian teks bebas", af: "Vryteks-soektog",
  },
  "referenzvideos.geschwindigkeitEgal": {
    de: "egal", en: "any", es: "cualquiera", pt: "qualquer", sv: "valfri",
    fi: "mikä tahansa", zh: "不限", ja: "指定なし", id: "bebas", ms: "apa-apa", af: "enige",
  },
  "referenzvideos.geschwindigkeitCa": {
    de: "ca. {wert} m/s (±{toleranz} m/s)", en: "approx. {wert} m/s (±{toleranz} m/s)", es: "aprox. {wert} m/s (±{toleranz} m/s)", pt: "aprox. {wert} m/s (±{toleranz} m/s)", sv: "ca {wert} m/s (±{toleranz} m/s)",
    fi: "n. {wert} m/s (±{toleranz} m/s)", zh: "约{wert} m/s（±{toleranz} m/s）", ja: "約{wert} m/s（±{toleranz} m/s）", id: "sekitar {wert} m/s (±{toleranz} m/s)", ms: "lebih kurang {wert} m/s (±{toleranz} m/s)", af: "ong. {wert} m/s (±{toleranz} m/s)",
  },
  "referenzvideos.zuruecksetzen": {
    de: "Zurücksetzen", en: "Reset", es: "Restablecer", pt: "Redefinir", sv: "Återställ",
    fi: "Nollaa", zh: "重置", ja: "リセット", id: "Atur ulang", ms: "Set semula", af: "Herstel",
  },
  "referenzvideos.keineTreffer": {
    de: "Keine Referenzvideos gefunden. Versuch andere Filter.",
    en: "No reference videos found. Try different filters.",
    es: "No se encontraron videos de referencia. Prueba con otros filtros.",
    pt: "Nenhum vídeo de referência encontrado. Tente outros filtros.",
    sv: "Inga referensvideor hittades. Prova andra filter.",
    fi: "Referenssivideoita ei löytynyt. Kokeile eri suodattimia.",
    zh: "未找到参考视频。请尝试其他筛选条件。",
    ja: "リファレンス動画が見つかりませんでした。別のフィルターをお試しください。",
    id: "Tidak ada video referensi ditemukan. Coba filter lain.",
    ms: "Tiada video rujukan dijumpai. Cuba tapisan lain.",
    af: "Geen verwysingsvideo's gevind nie. Probeer ander filters.",
  },

  "upload.eyebrow": {
    de: "Beitrag einreichen", en: "Submit contribution", es: "Enviar contribución", pt: "Enviar contribuição", sv: "Skicka bidrag",
    fi: "Lähetä osallistuminen", zh: "提交内容", ja: "投稿を送信", id: "Kirim kontribusi", ms: "Hantar sumbangan", af: "Dien bydrae in",
  },
  "upload.seitenTitel": {
    de: "Video hochladen", en: "Upload video", es: "Subir video", pt: "Enviar vídeo", sv: "Ladda upp video",
    fi: "Lataa video", zh: "上传视频", ja: "動画をアップロード", id: "Unggah video", ms: "Muat naik video", af: "Laai video op",
  },
  "upload.seitenUntertitel": {
    de: "Lade ein kurzes Erklärvideo (15–30 Sek.) hoch. Nach dem Absenden landet es automatisch im Status „In Prüfung“ und wird von einem Trainer freigegeben, bevor es für alle sichtbar ist.",
    en: "Upload a short explainer video (15–30 sec). After submitting, it automatically goes into \"In Review\" status and is approved by a trainer before it's visible to everyone.",
    es: "Sube un video explicativo breve (15–30 seg). Después de enviarlo, pasa automáticamente al estado \"En revisión\" y es aprobado por un capacitador antes de ser visible para todos.",
    pt: "Envie um vídeo explicativo curto (15–30 seg). Após o envio, ele entra automaticamente no status \"Em revisão\" e é aprovado por um instrutor antes de ficar visível para todos.",
    sv: "Ladda upp en kort instruktionsvideo (15–30 sek). Efter inlämning hamnar den automatiskt i status \"Under granskning\" och godkänns av en utbildare innan den blir synlig för alla.",
    fi: "Lataa lyhyt selitysvideo (15–30 s). Lähettämisen jälkeen se siirtyy automaattisesti tilaan \"Tarkistuksessa\" ja kouluttaja hyväksyy sen ennen kuin se näkyy kaikille.",
    zh: "上传一段简短的讲解视频（15–30秒）。提交后会自动进入“审核中”状态，需经培训师批准后才对所有人可见。",
    ja: "短い説明動画（15〜30秒）をアップロードしてください。送信後、自動的に「審査中」ステータスになり、トレーナーが承認するまで全員に表示されません。",
    id: "Unggah video penjelasan singkat (15–30 detik). Setelah dikirim, otomatis berstatus \"Dalam Peninjauan\" dan akan disetujui oleh pelatih sebelum terlihat oleh semua orang.",
    ms: "Muat naik video penerangan ringkas (15–30 saat). Selepas dihantar, ia secara automatik berstatus \"Dalam Semakan\" dan diluluskan oleh jurulatih sebelum kelihatan kepada semua orang.",
    af: "Laai 'n kort verduidelikingsvideo (15–30 sek.) op. Na indiening beland dit outomaties in die status \"Onder hersiening\" en word deur 'n afrigter goedgekeur voordat dit vir almal sigbaar is.",
  },
  "upload.artDesVideos": {
    de: "Art des Videos", en: "Video Type", es: "Tipo de video", pt: "Tipo de vídeo", sv: "Videotyp",
    fi: "Videon tyyppi", zh: "视频类型", ja: "動画の種類", id: "Jenis Video", ms: "Jenis Video", af: "Video-tipe",
  },
  "upload.schulungsvideo": {
    de: "Schulungsvideo", en: "Training Video", es: "Video de capacitación", pt: "Vídeo de treinamento", sv: "Utbildningsvideo",
    fi: "Koulutusvideo", zh: "培训视频", ja: "トレーニング動画", id: "Video Pelatihan", ms: "Video Latihan", af: "Opleidingsvideo",
  },
  "upload.referenzvideo": {
    de: "Referenzvideo", en: "Reference Video", es: "Video de referencia", pt: "Vídeo de referência", sv: "Referensvideo",
    fi: "Referenssivideo", zh: "参考视频", ja: "リファレンス動画", id: "Video Referensi", ms: "Video Rujukan", af: "Verwysingsvideo",
  },
  "upload.hinweisSchulung": {
    de: "Erklärt Technikern, wie ein Teil funktioniert oder gewartet wird – erscheint in der Video-Bibliothek.",
    en: "Explains to technicians how a part works or is maintained – appears in the video library.",
    es: "Explica a los técnicos cómo funciona o se mantiene una pieza – aparece en la videoteca.",
    pt: "Explica aos técnicos como uma peça funciona ou é mantida – aparece na videoteca.",
    sv: "Förklarar för tekniker hur en del fungerar eller underhålls – visas i videobiblioteket.",
    fi: "Selittää teknikoille, miten osa toimii tai sitä huolletaan – näkyy videokirjastossa.",
    zh: "向技术人员讲解零件的工作原理或维护方式——显示在视频库中。",
    ja: "部品の仕組みやメンテナンス方法を技術者に説明します – ビデオライブラリに表示されます。",
    id: "Menjelaskan kepada teknisi cara kerja atau perawatan suatu komponen – muncul di perpustakaan video.",
    ms: "Menerangkan kepada juruteknik cara bahagian berfungsi atau diselenggara – muncul dalam perpustakaan video.",
    af: "Verduidelik aan tegnici hoe 'n onderdeel werk of onderhou word – verskyn in die videobiblioteek.",
  },
  "upload.hinweisReferenz": {
    de: "Zeigt, wie ein HOSCH-Gerät in einer Kundenanlage läuft – erscheint im Bereich \"Referenzvideos\".",
    en: "Shows how a HOSCH device performs in a customer's system – appears in the \"Reference Videos\" section.",
    es: "Muestra cómo funciona un equipo HOSCH en la instalación de un cliente – aparece en la sección \"Videos de referencia\".",
    pt: "Mostra como um equipamento HOSCH funciona na instalação de um cliente – aparece na seção \"Vídeos de referência\".",
    sv: "Visar hur en HOSCH-utrustning fungerar i en kunds anläggning – visas i avsnittet \"Referensvideor\".",
    fi: "Näyttää, miten HOSCH-laite toimii asiakkaan laitoksessa – näkyy \"Referenssivideot\"-osiossa.",
    zh: "展示HOSCH设备在客户设施中的运行情况——显示在“参考视频”区域。",
    ja: "HOSCH機器がお客様の設備でどのように稼働しているかを示します – 「リファレンス動画」セクションに表示されます。",
    id: "Menunjukkan cara kerja perangkat HOSCH di instalasi pelanggan – muncul di bagian \"Video Referensi\".",
    ms: "Menunjukkan cara peranti HOSCH berfungsi di loji pelanggan – muncul dalam bahagian \"Video Rujukan\".",
    af: "Wys hoe 'n HOSCH-toestel in 'n kliënt se aanleg presteer – verskyn in die \"Verwysingsvideo's\"-afdeling.",
  },
  "upload.titel": {
    de: "Titel", en: "Title", es: "Título", pt: "Título", sv: "Titel",
    fi: "Otsikko", zh: "标题", ja: "タイトル", id: "Judul", ms: "Tajuk", af: "Titel",
  },
  "upload.titelPlatzhalter": {
    de: "z. B. Dichtungsring am Ventil XY wechseln", en: "e.g. Replace sealing ring on valve XY", es: "p. ej. Cambiar el anillo de sellado en la válvula XY", pt: "ex.: Trocar o anel de vedação na válvula XY", sv: "t.ex. Byt tätningsring på ventil XY",
    fi: "esim. Vaihda tiivisterengas venttiiliin XY", zh: "例如：更换阀门XY的密封圈", ja: "例：バルブXYのシールリングを交換", id: "contoh: Ganti cincin segel pada katup XY", ms: "cth: Tukar gelang kedap pada injap XY", af: "bv. Vervang afdigtingsring op klep XY",
  },
  "upload.videodatei": {
    de: "Videodatei", en: "Video File", es: "Archivo de video", pt: "Arquivo de vídeo", sv: "Videofil",
    fi: "Videotiedosto", zh: "视频文件", ja: "動画ファイル", id: "File Video", ms: "Fail Video", af: "Videolêer",
  },
  "upload.laengeErkannt": {
    de: "Länge erkannt: {sekunden} Sek.", en: "Length detected: {sekunden} sec.", es: "Duración detectada: {sekunden} s", pt: "Duração detectada: {sekunden} s", sv: "Längd upptäckt: {sekunden} sek.",
    fi: "Kesto tunnistettu: {sekunden} s", zh: "检测到时长：{sekunden}秒", ja: "検出された長さ：{sekunden}秒", id: "Durasi terdeteksi: {sekunden} detik", ms: "Tempoh dikesan: {sekunden} saat", af: "Lengte bespeur: {sekunden} sek.",
  },
  "upload.vorschaubildAutomatisch": {
    de: "Automatisch erzeugtes Vorschaubild", en: "Automatically generated thumbnail", es: "Miniatura generada automáticamente", pt: "Miniatura gerada automaticamente", sv: "Automatiskt genererad miniatyrbild",
    fi: "Automaattisesti luotu esikatselukuva", zh: "自动生成的缩略图", ja: "自動生成されたサムネイル", id: "Thumbnail dibuat otomatis", ms: "Lakaran kecil dijana secara automatik", af: "Outomaties gegenereerde duimnael",
  },
  "upload.wohin": {
    de: "Wo gehört das Video hin?", en: "Where does this video belong?", es: "¿Dónde pertenece este video?", pt: "Onde este vídeo pertence?", sv: "Var hör videon hemma?",
    fi: "Mihin video kuuluu?", zh: "该视频应归入哪里？", ja: "この動画はどこに属しますか？", id: "Video ini termasuk kategori apa?", ms: "Video ini tergolong di mana?", af: "Waar hoort hierdie video?",
  },
  "upload.teil": {
    de: "Teil", en: "Part", es: "Pieza", pt: "Peça", sv: "Del",
    fi: "Osa", zh: "零件", ja: "部品", id: "Komponen", ms: "Bahagian", af: "Onderdeel",
  },
  "upload.bitteWaehlen": {
    de: "Bitte wählen", en: "Please select", es: "Seleccionar", pt: "Selecione", sv: "Välj",
    fi: "Valitse", zh: "请选择", ja: "選択してください", id: "Silakan pilih", ms: "Sila pilih", af: "Kies asseblief",
  },
  "upload.keineTeileHinweis": {
    de: "Für diese Kategorie gibt es noch keine Teile. Ein Admin kann welche unter „Kategorien & Teile“ anlegen.",
    en: "There are no parts for this category yet. An admin can add some under \"Categories & Parts\".",
    es: "Aún no hay piezas para esta categoría. Un administrador puede agregarlas en \"Categorías y piezas\".",
    pt: "Ainda não há peças para esta categoria. Um admin pode adicionar em \"Categorias e peças\".",
    sv: "Det finns inga delar för denna kategori än. En admin kan lägga till några under \"Kategorier & delar\".",
    fi: "Tälle kategorialle ei ole vielä osia. Pääkäyttäjä voi lisätä niitä kohdassa \"Kategoriat ja osat\".",
    zh: "该分类下还没有零件。管理员可以在“分类与零件”中添加。",
    ja: "このカテゴリーにはまだ部品がありません。管理者が「カテゴリーと部品」で追加できます。",
    id: "Belum ada komponen untuk kategori ini. Admin dapat menambahkannya di \"Kategori & Komponen\".",
    ms: "Belum ada bahagian untuk kategori ini. Admin boleh menambah di \"Kategori & Bahagian\".",
    af: "Daar is nog geen onderdele vir hierdie kategorie nie. 'n Admin kan dit by \"Kategorieë & onderdele\" byvoeg.",
  },
  "upload.kurzbeschreibung": {
    de: "Kurzbeschreibung / Schritt-für-Schritt-Anleitung", en: "Short description / step-by-step guide", es: "Descripción breve / guía paso a paso", pt: "Descrição breve / guia passo a passo", sv: "Kort beskrivning / steg-för-steg-guide",
    fi: "Lyhyt kuvaus / vaiheittainen ohje", zh: "简短说明/分步指南", ja: "簡単な説明・手順ガイド", id: "Deskripsi singkat / panduan langkah demi langkah", ms: "Penerangan ringkas / panduan langkah demi langkah", af: "Kort beskrywing / stap-vir-stap-gids",
  },
  "upload.beschreibungPlatzhalter": {
    de: "1. Maschine ausschalten\n2. Abdeckung öffnen\n3. …", en: "1. Turn off the machine\n2. Open the cover\n3. …", es: "1. Apagar la máquina\n2. Abrir la tapa\n3. …", pt: "1. Desligar a máquina\n2. Abrir a tampa\n3. …", sv: "1. Stäng av maskinen\n2. Öppna locket\n3. …",
    fi: "1. Sammuta kone\n2. Avaa suojus\n3. …", zh: "1. 关闭机器\n2. 打开盖板\n3. …", ja: "1. 機械の電源を切る\n2. カバーを開ける\n3. …", id: "1. Matikan mesin\n2. Buka penutup\n3. …", ms: "1. Matikan mesin\n2. Buka penutup\n3. …", af: "1. Skakel die masjien af\n2. Maak die deksel oop\n3. …",
  },
  "upload.zusatzfelderHinweis": {
    de: "Wähle oben bei „Wo gehört das Video hin?“ einen Hersteller mit Referenzvideo-Zusatzfeldern (z. B. HOSCH), um Material, Geschwindigkeit usw. anzugeben.",
    en: "Select a manufacturer with reference video extra fields (e.g. HOSCH) above under \"Where does this video belong?\" to specify material, speed, etc.",
    es: "Selecciona arriba, en \"¿Dónde pertenece este video?\", un fabricante con campos adicionales de video de referencia (p. ej. HOSCH) para indicar material, velocidad, etc.",
    pt: "Selecione acima, em \"Onde este vídeo pertence?\", um fabricante com campos adicionais de vídeo de referência (ex.: HOSCH) para informar material, velocidade etc.",
    sv: "Välj ovan under \"Var hör videon hemma?\" en tillverkare med extrafält för referensvideo (t.ex. HOSCH) för att ange material, hastighet osv.",
    fi: "Valitse yllä kohdassa \"Mihin video kuuluu?\" valmistaja, jolla on referenssivideon lisäkentät (esim. HOSCH), ilmoittaaksesi materiaalin, nopeuden jne.",
    zh: "在上方“该视频应归入哪里？”中选择一个具有参考视频附加字段的制造商（例如HOSCH），以填写材料、速度等信息。",
    ja: "上の「この動画はどこに属しますか？」で、リファレンス動画の追加項目を持つメーカー（HOSCHなど）を選択すると、材料や速度などを入力できます。",
    id: "Pilih di atas pada \"Video ini termasuk kategori apa?\" produsen dengan bidang tambahan video referensi (mis. HOSCH) untuk mengisi material, kecepatan, dll.",
    ms: "Pilih di atas pada \"Video ini tergolong di mana?\" pengeluar dengan medan tambahan video rujukan (cth. HOSCH) untuk nyatakan bahan, kelajuan, dll.",
    af: "Kies bo by \"Waar hoort hierdie video?\" 'n vervaardiger met bykomende verwysingsvideo-velde (bv. HOSCH) om materiaal, spoed, ens. aan te dui.",
  },
  "upload.zusatzangaben": {
    de: "Zusatzangaben Referenzvideo ({hersteller})", en: "Additional reference video details ({hersteller})", es: "Datos adicionales del video de referencia ({hersteller})", pt: "Dados adicionais do vídeo de referência ({hersteller})", sv: "Ytterligare uppgifter referensvideo ({hersteller})",
    fi: "Referenssivideon lisätiedot ({hersteller})", zh: "参考视频附加信息（{hersteller}）", ja: "リファレンス動画の追加情報（{hersteller}）", id: "Detail tambahan video referensi ({hersteller})", ms: "Butiran tambahan video rujukan ({hersteller})", af: "Bykomende verwysingsvideo-besonderhede ({hersteller})",
  },
  "upload.material": {
    de: "Material", en: "Material", es: "Material", pt: "Material", sv: "Material",
    fi: "Materiaali", zh: "材料", ja: "素材", id: "Material", ms: "Bahan", af: "Materiaal",
  },
  "upload.materialSonstigesPlatzhalter": {
    de: "Welches Material?", en: "Which material?", es: "¿Qué material?", pt: "Qual material?", sv: "Vilket material?",
    fi: "Mikä materiaali?", zh: "哪种材料？", ja: "どの素材ですか？", id: "Material apa?", ms: "Bahan apa?", af: "Watter materiaal?",
  },
  "upload.foerderbandbreite": {
    de: "Förderbandbreite", en: "Belt Width", es: "Ancho de la cinta", pt: "Largura da correia", sv: "Bandbredd",
    fi: "Hihnan leveys", zh: "输送带宽度", ja: "ベルト幅", id: "Lebar Sabuk", ms: "Lebar Tali Sawat", af: "Bandwydte",
  },
  "upload.geschwindigkeit": {
    de: "Geschwindigkeit", en: "Speed", es: "Velocidad", pt: "Velocidade", sv: "Hastighet",
    fi: "Nopeus", zh: "速度", ja: "速度", id: "Kecepatan", ms: "Kelajuan", af: "Spoed",
  },
  "upload.beltConnection": {
    de: "Belt Connection", en: "Belt Connection", es: "Belt Connection", pt: "Belt Connection", sv: "Belt Connection",
    fi: "Belt Connection", zh: "皮带连接方式", ja: "ベルト接続方式", id: "Belt Connection", ms: "Belt Connection", af: "Belt Connection",
  },
  "upload.mechanicalSplicePlatzhalter": {
    de: "Welche Art von Mechanical Splice?", en: "What kind of mechanical splice?", es: "¿Qué tipo de empalme mecánico?", pt: "Que tipo de emenda mecânica?", sv: "Vilken typ av mekanisk skarv?",
    fi: "Minkälainen mekaaninen liitos?", zh: "哪种机械接头类型？", ja: "どのタイプのメカニカルスプライスですか？", id: "Jenis sambungan mekanis apa?", ms: "Jenis sambungan mekanikal apa?", af: "Watter tipe meganiese las?",
  },
  "upload.runbackReversible": {
    de: "Runback/Reversible", en: "Runback/Reversible", es: "Runback/Reversible", pt: "Runback/Reversible", sv: "Runback/Reversible",
    fi: "Runback/Reversible", zh: "逆转/可逆", ja: "逆走/リバーシブル", id: "Runback/Reversible", ms: "Runback/Reversible", af: "Runback/Reversible",
  },
  "upload.land": {
    de: "Land", en: "Country", es: "País", pt: "País", sv: "Land",
    fi: "Maa", zh: "国家", ja: "国", id: "Negara", ms: "Negara", af: "Land",
  },
  "upload.landPlatzhalter": {
    de: "z. B. Deutschland", en: "e.g. Germany", es: "p. ej. Alemania", pt: "ex.: Alemanha", sv: "t.ex. Tyskland",
    fi: "esim. Saksa", zh: "例如：德国", ja: "例：ドイツ", id: "contoh: Jerman", ms: "cth: Jerman", af: "bv. Duitsland",
  },
  "upload.andereBesonderheiten": {
    de: "Andere Besonderheiten", en: "Other Special Notes", es: "Otras particularidades", pt: "Outras particularidades", sv: "Andra särdrag",
    fi: "Muut erikoisuudet", zh: "其他特殊说明", ja: "その他の特記事項", id: "Catatan khusus lainnya", ms: "Catatan khas lain", af: "Ander besonderhede",
  },
  "upload.besonderheitenPlatzhalter": {
    de: "Freies Feld", en: "Free text", es: "Campo libre", pt: "Campo livre", sv: "Fritt fält",
    fi: "Vapaa kenttä", zh: "自由填写", ja: "自由記入欄", id: "Bidang bebas", ms: "Medan bebas", af: "Vrye veld",
  },
  "upload.fehlerKeineDatei": {
    de: "Bitte eine Videodatei auswählen.", en: "Please select a video file.", es: "Selecciona un archivo de video.", pt: "Selecione um arquivo de vídeo.", sv: "Välj en videofil.",
    fi: "Valitse videotiedosto.", zh: "请选择视频文件。", ja: "動画ファイルを選択してください。", id: "Silakan pilih file video.", ms: "Sila pilih fail video.", af: "Kies asseblief 'n videolêer.",
  },
  "upload.fehlerKeinTitel": {
    de: "Bitte einen Titel eingeben.", en: "Please enter a title.", es: "Introduce un título.", pt: "Digite um título.", sv: "Ange en titel.",
    fi: "Anna otsikko.", zh: "请输入标题。", ja: "タイトルを入力してください。", id: "Silakan masukkan judul.", ms: "Sila masukkan tajuk.", af: "Voer asseblief 'n titel in.",
  },
  "upload.fehlerUploadFehlgeschlagen": {
    de: "Upload fehlgeschlagen: {meldung}", en: "Upload failed: {meldung}", es: "Error al subir: {meldung}", pt: "Falha no envio: {meldung}", sv: "Uppladdning misslyckades: {meldung}",
    fi: "Lataus epäonnistui: {meldung}", zh: "上传失败：{meldung}", ja: "アップロードに失敗しました：{meldung}", id: "Unggah gagal: {meldung}", ms: "Muat naik gagal: {meldung}", af: "Oplaai het misluk: {meldung}",
  },
  "upload.fehlerUnbekannt": {
    de: "Unbekannter Fehler beim Speichern.", en: "Unknown error while saving.", es: "Error desconocido al guardar.", pt: "Erro desconhecido ao salvar.", sv: "Okänt fel vid sparande.",
    fi: "Tuntematon virhe tallennettaessa.", zh: "保存时发生未知错误。", ja: "保存中に不明なエラーが発生しました。", id: "Kesalahan tidak diketahui saat menyimpan.", ms: "Ralat tidak diketahui semasa menyimpan.", af: "Onbekende fout tydens stoor.",
  },
  "upload.fortschrittVideo": {
    de: "Video wird hochgeladen …", en: "Uploading video …", es: "Subiendo video …", pt: "Enviando vídeo …", sv: "Laddar upp video …",
    fi: "Ladataan videota …", zh: "正在上传视频…", ja: "動画をアップロード中…", id: "Mengunggah video …", ms: "Memuat naik video …", af: "Laai video op …",
  },
  "upload.fortschrittThumbnail": {
    de: "Vorschaubild wird hochgeladen …", en: "Uploading thumbnail …", es: "Subiendo miniatura …", pt: "Enviando miniatura …", sv: "Laddar upp miniatyrbild …",
    fi: "Ladataan esikatselukuvaa …", zh: "正在上传缩略图…", ja: "サムネイルをアップロード中…", id: "Mengunggah thumbnail …", ms: "Memuat naik lakaran kecil …", af: "Laai duimnael op …",
  },
  "upload.fortschrittEintrag": {
    de: "Eintrag wird gespeichert …", en: "Saving entry …", es: "Guardando entrada …", pt: "Salvando registro …", sv: "Sparar post …",
    fi: "Tallennetaan merkintää …", zh: "正在保存条目…", ja: "エントリーを保存中…", id: "Menyimpan entri …", ms: "Menyimpan entri …", af: "Stoor inskrywing …",
  },
  "upload.wirdHochgeladen": {
    de: "Wird hochgeladen …", en: "Uploading …", es: "Subiendo …", pt: "Enviando …", sv: "Laddar upp …",
    fi: "Ladataan …", zh: "正在上传…", ja: "アップロード中…", id: "Mengunggah …", ms: "Memuat naik …", af: "Laai op …",
  },
  "upload.videoEinreichen": {
    de: "Video einreichen", en: "Submit video", es: "Enviar video", pt: "Enviar vídeo", sv: "Skicka in video",
    fi: "Lähetä video", zh: "提交视频", ja: "動画を送信", id: "Kirim video", ms: "Hantar video", af: "Dien video in",
  },

  "profil.eyebrow": {
    de: "Mitarbeiterakte", en: "Employee Record", es: "Ficha del empleado", pt: "Ficha do funcionário", sv: "Personalakt",
    fi: "Työntekijätiedosto", zh: "员工档案", ja: "従業員記録", id: "Berkas Karyawan", ms: "Fail Pekerja", af: "Werknemerlêer",
  },
  "profil.titel": {
    de: "Mein Profil", en: "My Profile", es: "Mi perfil", pt: "Meu perfil", sv: "Min profil",
    fi: "Oma profiili", zh: "我的资料", ja: "マイプロフィール", id: "Profil Saya", ms: "Profil Saya", af: "My profiel",
  },
  "profil.untertitel": {
    de: "Passe deinen Namen, Standort und dein Profilbild an.", en: "Update your name, location and profile picture.", es: "Actualiza tu nombre, ubicación y foto de perfil.", pt: "Atualize seu nome, localização e foto de perfil.", sv: "Uppdatera ditt namn, plats och profilbild.",
    fi: "Päivitä nimesi, sijaintisi ja profiilikuvasi.", zh: "更新你的姓名、地点和头像。", ja: "名前、所在地、プロフィール写真を更新できます。", id: "Perbarui nama, lokasi, dan foto profil Anda.", ms: "Kemas kini nama, lokasi dan gambar profil anda.", af: "Werk jou naam, ligging en profielfoto by.",
  },
  "profil.profilbildAendern": {
    de: "Profilbild ändern", en: "Change profile picture", es: "Cambiar foto de perfil", pt: "Alterar foto de perfil", sv: "Ändra profilbild",
    fi: "Vaihda profiilikuva", zh: "更改头像", ja: "プロフィール写真を変更", id: "Ubah foto profil", ms: "Tukar gambar profil", af: "Verander profielfoto",
  },
  "profil.name": {
    de: "Name", en: "Name", es: "Nombre", pt: "Nome", sv: "Namn",
    fi: "Nimi", zh: "姓名", ja: "名前", id: "Nama", ms: "Nama", af: "Naam",
  },
  "profil.standort": {
    de: "Standort (optional)", en: "Location (optional)", es: "Ubicación (opcional)", pt: "Localização (opcional)", sv: "Plats (valfritt)",
    fi: "Sijainti (valinnainen)", zh: "地点（可选）", ja: "所在地（任意）", id: "Lokasi (opsional)", ms: "Lokasi (pilihan)", af: "Ligging (opsioneel)",
  },
  "profil.standortPlatzhalter": {
    de: "z. B. Deutschland, Brasilien, ...", en: "e.g. Germany, Brazil, ...", es: "p. ej. Alemania, Brasil, ...", pt: "ex.: Alemanha, Brasil, ...", sv: "t.ex. Tyskland, Brasilien, ...",
    fi: "esim. Saksa, Brasilia, ...", zh: "例如：德国、巴西……", ja: "例：ドイツ、ブラジル、...", id: "contoh: Jerman, Brasil, ...", ms: "cth: Jerman, Brazil, ...", af: "bv. Duitsland, Brasilië, ...",
  },
  "profil.firma": {
    de: "Firma/Abteilung (optional)", en: "Company/Department (optional)", es: "Empresa/Departamento (opcional)", pt: "Empresa/Departamento (opcional)", sv: "Företag/avdelning (valfritt)",
    fi: "Yritys/osasto (valinnainen)", zh: "公司/部门（可选）", ja: "会社・部署（任意）", id: "Perusahaan/Departemen (opsional)", ms: "Syarikat/Jabatan (pilihan)", af: "Maatskappy/afdeling (opsioneel)",
  },
  "profil.firmaPlatzhalter": {
    de: "z. B. HOSCH, oder Name der Partnerfirma", en: "e.g. HOSCH, or name of partner company", es: "p. ej. HOSCH, o nombre de la empresa asociada", pt: "ex.: HOSCH, ou nome da empresa parceira", sv: "t.ex. HOSCH, eller partnerföretagets namn",
    fi: "esim. HOSCH, tai kumppaniyrityksen nimi", zh: "例如：HOSCH，或合作公司名称", ja: "例：HOSCH、またはパートナー企業名", id: "contoh: HOSCH, atau nama perusahaan mitra", ms: "cth: HOSCH, atau nama syarikat rakan kongsi", af: "bv. HOSCH, of naam van vennootmaatskappy",
  },
  "profil.spracheHinweis": {
    de: "Ändert die Sprache der App-Oberfläche sofort und dauerhaft.", en: "Changes the app interface language immediately and permanently.", es: "Cambia el idioma de la interfaz de la app de inmediato y de forma permanente.", pt: "Altera o idioma da interface do app imediata e permanentemente.", sv: "Ändrar appens gränssnittsspråk direkt och permanent.",
    fi: "Muuttaa sovelluksen käyttöliittymän kielen välittömästi ja pysyvästi.", zh: "立即并永久更改应用界面语言。", ja: "アプリのインターフェース言語をすぐに、そして恒久的に変更します。", id: "Mengubah bahasa antarmuka aplikasi secara langsung dan permanen.", ms: "Menukar bahasa antara muka aplikasi serta-merta dan kekal.", af: "Verander die app-koppelvlak se taal onmiddellik en permanent.",
  },
  "profil.speichern": {
    de: "Speichern", en: "Save", es: "Guardar", pt: "Salvar", sv: "Spara",
    fi: "Tallenna", zh: "保存", ja: "保存", id: "Simpan", ms: "Simpan", af: "Stoor",
  },
  "profil.speichertLaeuft": {
    de: "Speichert …", en: "Saving …", es: "Guardando …", pt: "Salvando …", sv: "Sparar …",
    fi: "Tallennetaan …", zh: "保存中…", ja: "保存中…", id: "Menyimpan …", ms: "Menyimpan …", af: "Stoor …",
  },
  "profil.gespeichert": {
    de: "Profil gespeichert.", en: "Profile saved.", es: "Perfil guardado.", pt: "Perfil salvo.", sv: "Profil sparad.",
    fi: "Profiili tallennettu.", zh: "个人资料已保存。", ja: "プロフィールを保存しました。", id: "Profil disimpan.", ms: "Profil disimpan.", af: "Profiel gestoor.",
  },
  "profil.fehlerBildUpload": {
    de: "Bild-Upload fehlgeschlagen: {meldung}", en: "Image upload failed: {meldung}", es: "Error al subir la imagen: {meldung}", pt: "Falha no envio da imagem: {meldung}", sv: "Bilduppladdning misslyckades: {meldung}",
    fi: "Kuvan lataus epäonnistui: {meldung}", zh: "图片上传失败：{meldung}", ja: "画像のアップロードに失敗しました：{meldung}", id: "Unggah gambar gagal: {meldung}", ms: "Muat naik imej gagal: {meldung}", af: "Beeldoplaai het misluk: {meldung}",
  },
  "profil.fehlerStandard": {
    de: "Fehler beim Speichern.", en: "Error saving.", es: "Error al guardar.", pt: "Erro ao salvar.", sv: "Fel vid sparande.",
    fi: "Virhe tallennettaessa.", zh: "保存出错。", ja: "保存エラーが発生しました。", id: "Kesalahan saat menyimpan.", ms: "Ralat semasa menyimpan.", af: "Fout tydens stoor.",
  },
};
