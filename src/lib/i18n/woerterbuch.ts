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

  "admin.pruefungTitel": {
    de: "Videos in Prüfung", en: "Videos in Review", es: "Videos en revisión", pt: "Vídeos em revisão", sv: "Videor under granskning",
    fi: "Tarkistettavat videot", zh: "待审核视频", ja: "審査中の動画", id: "Video dalam peninjauan", ms: "Video dalam semakan", af: "Video's onder hersiening",
  },
  "admin.pruefungUntertitel": {
    de: "Ordne Kategorie, Teil und Tags zu, ergänze bei Bedarf die Beschreibung und gib das Video anschließend frei.",
    en: "Assign category, part and tags, add to the description if needed, and then approve the video.",
    es: "Asigna categoría, pieza y etiquetas, completa la descripción si es necesario y luego aprueba el video.",
    pt: "Atribua categoria, peça e tags, complete a descrição se necessário e depois aprove o vídeo.",
    sv: "Tilldela kategori, del och taggar, komplettera beskrivningen vid behov och godkänn sedan videon.",
    fi: "Määritä kategoria, osa ja tunnisteet, täydennä kuvaus tarvittaessa ja hyväksy video.",
    zh: "分配分类、零件和标签，如有需要补充说明，然后批准该视频。",
    ja: "カテゴリー、部品、タグを割り当て、必要に応じて説明を追加してから動画を承認してください。",
    id: "Tetapkan kategori, komponen, dan tag, lengkapi deskripsi jika perlu, lalu setujui video.",
    ms: "Tetapkan kategori, bahagian dan tag, lengkapkan penerangan jika perlu, kemudian luluskan video.",
    af: "Ken kategorie, onderdeel en etikette toe, vul die beskrywing indien nodig aan, en keur dan die video goed.",
  },
  "admin.pruefungLeer": {
    de: "Aktuell gibt es nichts zu prüfen – alle Videos sind bearbeitet.",
    en: "Nothing to review right now – all videos have been processed.",
    es: "No hay nada que revisar por ahora – todos los videos han sido procesados.",
    pt: "Não há nada para revisar agora – todos os vídeos foram processados.",
    sv: "Inget att granska just nu – alla videor är bearbetade.",
    fi: "Ei tarkistettavaa juuri nyt – kaikki videot on käsitelty.",
    zh: "目前没有待审核内容——所有视频均已处理。",
    ja: "現在審査待ちのものはありません – すべての動画が処理済みです。",
    id: "Tidak ada yang perlu ditinjau saat ini – semua video telah diproses.",
    ms: "Tiada apa untuk disemak sekarang – semua video telah diproses.",
    af: "Niks om nou te hersien nie – alle video's is verwerk.",
  },
  "admin.analyticsTitel": {
    de: "Analytics", en: "Analytics", es: "Estadísticas", pt: "Estatísticas", sv: "Statistik",
    fi: "Tilastot", zh: "数据分析", ja: "分析", id: "Analitik", ms: "Analitik", af: "Analise",
  },
  "admin.meistgeseheneVideos": {
    de: "Meistgesehene Videos", en: "Most Viewed Videos", es: "Videos más vistos", pt: "Vídeos mais assistidos", sv: "Mest visade videor",
    fi: "Katsotuimmat videot", zh: "浏览最多的视频", ja: "最も視聴された動画", id: "Video paling banyak ditonton", ms: "Video paling banyak ditonton", af: "Mees bekykte video's",
  },
  "admin.nochKeineAufrufe": {
    de: "Noch keine Aufrufe erfasst.", en: "No views recorded yet.", es: "Aún no se han registrado visualizaciones.", pt: "Ainda não há visualizações registradas.", sv: "Inga visningar registrerade än.",
    fi: "Ei vielä katselukertoja.", zh: "尚无浏览记录。", ja: "まだ視聴データがありません。", id: "Belum ada tampilan tercatat.", ms: "Tiada tontonan direkodkan lagi.", af: "Nog geen kykers aangeteken nie.",
  },
  "admin.titelSpalte": {
    de: "Titel", en: "Title", es: "Título", pt: "Título", sv: "Titel",
    fi: "Otsikko", zh: "标题", ja: "タイトル", id: "Judul", ms: "Tajuk", af: "Titel",
  },
  "admin.dauerSpalte": {
    de: "Dauer", en: "Length", es: "Duración", pt: "Duração", sv: "Längd",
    fi: "Kesto", zh: "时长", ja: "長さ", id: "Durasi", ms: "Tempoh", af: "Lengte",
  },
  "admin.aufrufeSpalte": {
    de: "Aufrufe", en: "Views", es: "Visualizaciones", pt: "Visualizações", sv: "Visningar",
    fi: "Katselukerrat", zh: "浏览次数", ja: "視聴回数", id: "Tampilan", ms: "Tontonan", af: "Kykers",
  },
  "admin.suchenOhneTreffer": {
    de: "Suchanfragen ohne Treffer", en: "Searches with No Results", es: "Búsquedas sin resultados", pt: "Buscas sem resultados", sv: "Sökningar utan resultat",
    fi: "Hakuja ilman tuloksia", zh: "无结果的搜索", ja: "結果なしの検索", id: "Pencarian tanpa hasil", ms: "Carian tanpa hasil", af: "Soektogte sonder resultate",
  },
  "admin.suchenOhneTrefferUntertitel": {
    de: "Diese Begriffe wurden gesucht, ohne dass die Videothek Ergebnisse zeigen konnte – ein Hinweis darauf, wo Videos, Tags oder Synonyme fehlen.",
    en: "These terms were searched without the video library showing any results – a hint at where videos, tags or synonyms are missing.",
    es: "Se buscaron estos términos sin que la videoteca mostrara resultados – una pista de dónde faltan videos, etiquetas o sinónimos.",
    pt: "Esses termos foram pesquisados sem que a videoteca mostrasse resultados – uma pista de onde faltam vídeos, tags ou sinônimos.",
    sv: "Dessa termer söktes utan att videobiblioteket kunde visa resultat – en ledtråd om var videor, taggar eller synonymer saknas.",
    fi: "Näitä termejä haettiin ilman, että videokirjasto näytti tuloksia – vihje siitä, mistä videoita, tunnisteita tai synonyymejä puuttuu.",
    zh: "这些搜索词未能在视频库中找到结果——这提示了视频、标签或同义词的缺失之处。",
    ja: "これらのキーワードで検索されましたが、ビデオライブラリに結果が表示されませんでした – 動画・タグ・同義語が不足している箇所のヒントになります。",
    id: "Kata-kata ini dicari tanpa perpustakaan video menampilkan hasil – petunjuk di mana video, tag, atau sinonim yang hilang.",
    ms: "Perkataan ini dicari tanpa perpustakaan video menunjukkan hasil – petunjuk di mana video, tag atau sinonim yang hilang.",
    af: "Hierdie terme is gesoek sonder dat die videobiblioteek resultate kon wys – 'n aanduiding van waar video's, etikette of sinonieme ontbreek.",
  },
  "admin.bisherKeineErfolglosenSuchen": {
    de: "Bisher keine erfolglosen Suchen erfasst.", en: "No unsuccessful searches recorded yet.", es: "Aún no se han registrado búsquedas sin éxito.", pt: "Ainda não há buscas malsucedidas registradas.", sv: "Inga misslyckade sökningar registrerade än.",
    fi: "Ei vielä epäonnistuneita hakuja.", zh: "尚无失败搜索记录。", ja: "まだ失敗した検索はありません。", id: "Belum ada pencarian gagal tercatat.", ms: "Tiada carian gagal direkodkan lagi.", af: "Nog geen onsuksesvolle soektogte aangeteken nie.",
  },
  "admin.suchbegriffSpalte": {
    de: "Suchbegriff", en: "Search Term", es: "Término de búsqueda", pt: "Termo de busca", sv: "Sökterm",
    fi: "Hakusana", zh: "搜索词", ja: "検索キーワード", id: "Kata kunci pencarian", ms: "Kata kunci carian", af: "Soekterm",
  },
  "admin.haeufigkeitSpalte": {
    de: "Häufigkeit", en: "Frequency", es: "Frecuencia", pt: "Frequência", sv: "Frekvens",
    fi: "Toistuvuus", zh: "频率", ja: "頻度", id: "Frekuensi", ms: "Kekerapan", af: "Frekwensie",
  },
  "admin.zuletztGesuchtSpalte": {
    de: "Zuletzt gesucht", en: "Last Searched", es: "Última búsqueda", pt: "Última busca", sv: "Senast sökt",
    fi: "Viimeksi haettu", zh: "最近搜索时间", ja: "最終検索日", id: "Terakhir dicari", ms: "Terakhir dicari", af: "Laas gesoek",
  },
  "admin.kategorienTitel": {
    de: "Kategorien & Teile", en: "Categories & Parts", es: "Categorías y piezas", pt: "Categorias e peças", sv: "Kategorier & delar",
    fi: "Kategoriat ja osat", zh: "分类与零件", ja: "カテゴリーと部品", id: "Kategori & Komponen", ms: "Kategori & Bahagian", af: "Kategorieë & onderdele",
  },
  "admin.kategorienUntertitel": {
    de: "Baue die Struktur Industrie → Hersteller → Produkt → Kategorie auf und lege darunter Teile mit Beschreibung und ID-Nummer an.",
    en: "Build the structure Industry → Manufacturer → Product → Category and add parts with description and ID number underneath.",
    es: "Construye la estructura Industria → Fabricante → Producto → Categoría y agrega piezas con descripción y número de ID debajo.",
    pt: "Construa a estrutura Indústria → Fabricante → Produto → Categoria e adicione peças com descrição e número de ID abaixo.",
    sv: "Bygg strukturen Industri → Tillverkare → Produkt → Kategori och lägg till delar med beskrivning och ID-nummer under.",
    fi: "Rakenna rakenne Teollisuus → Valmistaja → Tuote → Kategoria ja lisää sen alle osia kuvauksella ja ID-numerolla.",
    zh: "构建“行业→制造商→产品→分类”的结构，并在其下添加带说明和编号的零件。",
    ja: "「業界 → メーカー → 製品 → カテゴリー」の構造を構築し、その下に説明とID番号付きの部品を追加します。",
    id: "Bangun struktur Industri → Produsen → Produk → Kategori dan tambahkan komponen dengan deskripsi dan nomor ID di bawahnya.",
    ms: "Bina struktur Industri → Pengeluar → Produk → Kategori dan tambah bahagian dengan penerangan dan nombor ID di bawahnya.",
    af: "Bou die struktuur Bedryf → Vervaardiger → Produk → Kategorie en voeg onderdele met beskrywing en ID-nommer daaronder by.",
  },
  "admin.lernpfadeTitel": {
    de: "Lernpfade", en: "Learning Paths", es: "Rutas de aprendizaje", pt: "Trilhas de aprendizagem", sv: "Utbildningsspår",
    fi: "Oppimispolut", zh: "学习路径", ja: "学習パス", id: "Jalur Pembelajaran", ms: "Laluan Pembelajaran", af: "Leerpaaie",
  },
  "admin.lernpfadeUntertitel": {
    de: "Gruppiere Videos in einer festen Reihenfolge, z. B. für den Einstieg in ein Thema.",
    en: "Group videos in a fixed order, e.g. as an introduction to a topic.",
    es: "Agrupa videos en un orden fijo, p. ej. como introducción a un tema.",
    pt: "Agrupe vídeos em uma ordem fixa, ex.: como introdução a um tópico.",
    sv: "Gruppera videor i en fast ordning, t.ex. som en introduktion till ett ämne.",
    fi: "Ryhmittele videoita kiinteässä järjestyksessä, esim. aiheeseen johdattamiseksi.",
    zh: "按固定顺序将视频分组，例如作为某个主题的入门介绍。",
    ja: "動画を固定順序でグループ化します（例：あるテーマへの入門として）。",
    id: "Kelompokkan video dalam urutan tetap, mis. sebagai pengantar suatu topik.",
    ms: "Kumpulkan video dalam susunan tetap, cth. sebagai pengenalan kepada topik.",
    af: "Groepeer video's in 'n vaste volgorde, bv. as 'n inleiding tot 'n onderwerp.",
  },
  "admin.lernpfadeLeer": {
    de: "Noch keine Lernpfade angelegt.", en: "No learning paths created yet.", es: "Aún no se han creado rutas de aprendizaje.", pt: "Ainda não há trilhas de aprendizagem criadas.", sv: "Inga utbildningsspår skapade än.",
    fi: "Ei vielä luotuja oppimispolkuja.", zh: "尚未创建学习路径。", ja: "まだ学習パスが作成されていません。", id: "Belum ada jalur pembelajaran dibuat.", ms: "Belum ada laluan pembelajaran dicipta.", af: "Nog geen leerpaaie geskep nie.",
  },
  "admin.videosBearbeiten": {
    de: "{anzahl} Videos – bearbeiten →", en: "{anzahl} videos – edit →", es: "{anzahl} videos – editar →", pt: "{anzahl} vídeos – editar →", sv: "{anzahl} videor – redigera →",
    fi: "{anzahl} videota – muokkaa →", zh: "{anzahl}个视频——编辑 →", ja: "{anzahl}件の動画 – 編集 →", id: "{anzahl} video – edit →", ms: "{anzahl} video – edit →", af: "{anzahl} video's – wysig →",
  },
  "admin.loeschanfragenTitel": {
    de: "Löschanfragen", en: "Deletion Requests", es: "Solicitudes de eliminación", pt: "Solicitações de exclusão", sv: "Raderingsförfrågningar",
    fi: "Poistopyynnöt", zh: "删除请求", ja: "削除リクエスト", id: "Permintaan Penghapusan", ms: "Permintaan Pemadaman", af: "Skrapversoeke",
  },
  "admin.loeschanfragenUntertitel": {
    de: "Techniker haben für diese Videos eine Löschung beantragt. Bestätige die Löschung oder lehne die Anfrage ab (das Video bleibt dann wie gehabt bestehen).",
    en: "Technicians have requested deletion for these videos. Confirm the deletion or reject the request (the video then remains as before).",
    es: "Los técnicos han solicitado la eliminación de estos videos. Confirma la eliminación o rechaza la solicitud (el video permanecerá como estaba).",
    pt: "Os técnicos solicitaram a exclusão desses vídeos. Confirme a exclusão ou rejeite a solicitação (o vídeo permanece como estava).",
    sv: "Tekniker har begärt radering av dessa videor. Bekräfta raderingen eller avslå begäran (videon förblir då som tidigare).",
    fi: "Teknikot ovat pyytäneet näiden videoiden poistoa. Vahvista poisto tai hylkää pyyntö (video pysyy silloin ennallaan).",
    zh: "技术人员已申请删除这些视频。请确认删除或拒绝该申请（视频将保持不变）。",
    ja: "技術者がこれらの動画の削除を申請しました。削除を確定するか、申請を却下してください（却下した場合、動画はそのまま残ります）。",
    id: "Teknisi telah mengajukan penghapusan untuk video ini. Konfirmasi penghapusan atau tolak permintaan (video akan tetap seperti semula).",
    ms: "Juruteknik telah memohon pemadaman untuk video ini. Sahkan pemadaman atau tolak permohonan (video akan kekal seperti sedia ada).",
    af: "Tegnici het skrapping vir hierdie video's versoek. Bevestig die skrapping of wys die versoek af (die video bly dan soos voorheen).",
  },
  "admin.loeschanfragenLeer": {
    de: "Aktuell keine offenen Löschanfragen.", en: "No open deletion requests right now.", es: "No hay solicitudes de eliminación pendientes.", pt: "Nenhuma solicitação de exclusão pendente.", sv: "Inga öppna raderingsförfrågningar just nu.",
    fi: "Ei avoimia poistopyyntöjä juuri nyt.", zh: "目前没有待处理的删除请求。", ja: "現在未処理の削除リクエストはありません。", id: "Tidak ada permintaan penghapusan terbuka saat ini.", ms: "Tiada permintaan pemadaman terbuka sekarang.", af: "Geen oop skrapversoeke tans nie.",
  },
  "admin.nutzerUntertitelSuperadmin": {
    de: "Als Superadmin kannst du alle Rollen vergeben, auch Admin/Superadmin, und Konten deaktivieren.",
    en: "As superadmin you can assign all roles, including admin/superadmin, and deactivate accounts.",
    es: "Como superadministrador puedes asignar todos los roles, incluidos admin/superadministrador, y desactivar cuentas.",
    pt: "Como superadmin você pode atribuir todas as funções, incluindo admin/superadmin, e desativar contas.",
    sv: "Som superadmin kan du tilldela alla roller, inklusive admin/superadmin, och inaktivera konton.",
    fi: "Pääkäyttäjänä voit myöntää kaikki roolit, myös admin/pääkäyttäjä, ja poistaa tilejä käytöstä.",
    zh: "作为超级管理员，你可以分配所有角色（包括管理员/超级管理员）并停用账户。",
    ja: "スーパー管理者として、管理者・スーパー管理者を含むすべての役割を割り当て、アカウントを無効化できます。",
    id: "Sebagai superadmin Anda dapat menetapkan semua peran, termasuk admin/superadmin, dan menonaktifkan akun.",
    ms: "Sebagai superadmin anda boleh menetapkan semua peranan, termasuk admin/superadmin, dan menyahaktifkan akaun.",
    af: "As superadmin kan jy alle rolle toeken, insluitend admin/superadmin, en rekeninge deaktiveer.",
  },
  "admin.nutzerUntertitelAdmin": {
    de: "Als Admin kannst du Techniker/Zuschauer verwalten und deaktivieren. Admin-Konten verwaltet nur der Superadmin.",
    en: "As admin you can manage and deactivate technicians/viewers. Only the superadmin manages admin accounts.",
    es: "Como administrador puedes gestionar y desactivar técnicos/espectadores. Solo el superadministrador gestiona cuentas de administrador.",
    pt: "Como admin você pode gerenciar e desativar técnicos/espectadores. Apenas o superadmin gerencia contas de admin.",
    sv: "Som admin kan du hantera och inaktivera tekniker/tittare. Endast superadmin hanterar adminkonton.",
    fi: "Ylläpitäjänä voit hallita ja poistaa käytöstä teknikoita/katsojia. Vain pääkäyttäjä hallitsee ylläpitäjätilejä.",
    zh: "作为管理员，你可以管理和停用技术人员/观看者账户。管理员账户仅由超级管理员管理。",
    ja: "管理者として、技術者・閲覧者を管理・無効化できます。管理者アカウントの管理はスーパー管理者のみが行えます。",
    id: "Sebagai admin Anda dapat mengelola dan menonaktifkan teknisi/penonton. Hanya superadmin yang mengelola akun admin.",
    ms: "Sebagai admin anda boleh mengurus dan menyahaktifkan juruteknik/penonton. Hanya superadmin mengurus akaun admin.",
    af: "As admin kan jy tegnici/kykers bestuur en deaktiveer. Slegs die superadmin bestuur admin-rekeninge.",
  },
  "admin.qrTitel": {
    de: "QR-Codes für Teile", en: "QR Codes for Parts", es: "Códigos QR para piezas", pt: "Códigos QR para peças", sv: "QR-koder för delar",
    fi: "QR-koodit osille", zh: "零件二维码", ja: "部品用QRコード", id: "Kode QR untuk Komponen", ms: "Kod QR untuk Bahagian", af: "QR-kodes vir onderdele",
  },
  "admin.qrUntertitel": {
    de: "Drucke diese QR-Codes aus und bringe sie am jeweiligen Maschinenteil an. Ein Scan öffnet direkt die passenden Videos.",
    en: "Print these QR codes and attach them to the respective machine part. Scanning opens the matching videos directly.",
    es: "Imprime estos códigos QR y colócalos en la pieza de máquina correspondiente. Al escanear se abren directamente los videos correspondientes.",
    pt: "Imprima estes códigos QR e coloque-os na respectiva peça da máquina. Ao escanear, os vídeos correspondentes abrem diretamente.",
    sv: "Skriv ut dessa QR-koder och sätt fast dem på respektive maskindel. En skanning öppnar direkt de matchande videorna.",
    fi: "Tulosta nämä QR-koodit ja kiinnitä ne vastaavaan konepäivittäiseen osaan. Skannaus avaa suoraan vastaavat videot.",
    zh: "打印这些二维码并贴在相应的机器零件上。扫描后会直接打开对应的视频。",
    ja: "これらのQRコードを印刷し、対応する機械部品に貼り付けてください。スキャンすると該当する動画が直接開きます。",
    id: "Cetak kode QR ini dan tempelkan pada komponen mesin yang bersangkutan. Memindai akan langsung membuka video yang sesuai.",
    ms: "Cetak kod QR ini dan lekatkan pada bahagian mesin yang berkenaan. Imbasan akan terus membuka video yang sepadan.",
    af: "Druk hierdie QR-kodes en heg dit aan die betrokke masjienonderdeel. 'n Skandering open die pasende video's direk.",
  },
  "admin.qrTagVerknuepfung": {
    de: "Verknüpfung mit TAGs/NFC an Geräten", en: "Linking with tags/NFC on devices", es: "Vinculación con TAGs/NFC en equipos", pt: "Vinculação com TAGs/NFC em equipamentos", sv: "Koppling med taggar/NFC på enheter",
    fi: "Yhdistäminen laitteiden TAG/NFC-tunnisteisiin", zh: "与设备上标签/NFC的关联", ja: "デバイス上のタグ・NFCとの連携", id: "Tautan dengan TAG/NFC pada perangkat", ms: "Pautan dengan TAG/NFC pada peranti", af: "Koppeling met TAGs/NFC op toestelle",
  },
  "admin.qrTagText1": {
    de: "Falls ein Gerät bereits einen eigenen TAG (QR-Code oder NFC-Chip) über die Service-App hat, kann diese App zusätzlich zur Geräte-Konfiguration einen Link auf Skill Manager anbieten, der direkt alle Videos zu den verbauten Teilen zeigt – ohne dass wir Zugriff auf die Service-App brauchen. Der Link muss nur so aufgebaut sein:",
    en: "If a device already has its own tag (QR code or NFC chip) via the service app, that app can offer an additional link to Skill Manager alongside the device configuration, showing directly all videos for the installed parts – without us needing access to the service app. The link only needs to be built like this:",
    es: "Si un equipo ya tiene su propio TAG (código QR o chip NFC) a través de la app de servicio, esa app puede ofrecer además un enlace a Skill Manager que muestre directamente todos los videos de las piezas instaladas, sin que necesitemos acceso a la app de servicio. El enlace solo debe construirse así:",
    pt: "Se um equipamento já tiver seu próprio TAG (código QR ou chip NFC) via o app de serviço, esse app pode oferecer adicionalmente um link para o Skill Manager que mostra diretamente todos os vídeos das peças instaladas – sem que precisemos de acesso ao app de serviço. O link só precisa ser construído assim:",
    sv: "Om en enhet redan har sin egen tagg (QR-kod eller NFC-chip) via serviceappen kan den appen dessutom erbjuda en länk till Skill Manager som direkt visar alla videor för de installerade delarna – utan att vi behöver åtkomst till serviceappen. Länken behöver bara byggas så här:",
    fi: "Jos laitteella on jo oma TAG (QR-koodi tai NFC-siru) huoltosovelluksen kautta, kyseinen sovellus voi tarjota laitekokoonpanon lisäksi linkin Skill Manageriin, joka näyttää suoraan kaikki asennettujen osien videot – ilman että tarvitsemme pääsyä huoltosovellukseen. Linkki tarvitsee vain rakentaa näin:",
    zh: "如果某设备已经通过服务应用拥有自己的标签（二维码或NFC芯片），该应用可以在设备配置旁额外提供一个指向Skill Manager的链接，直接显示所安装零件的所有视频——无需我们访问该服务应用。链接只需按以下方式构建：",
    ja: "デバイスがサービスアプリを通じて既に独自のタグ（QRコードまたはNFCチップ）を持っている場合、そのアプリはデバイス設定に加えてSkill Managerへのリンクを提供でき、取り付けられた部品のすべての動画を直接表示できます – サービスアプリへのアクセスは不要です。リンクは次のように構築するだけです：",
    id: "Jika suatu perangkat sudah memiliki TAG sendiri (kode QR atau chip NFC) melalui aplikasi servis, aplikasi tersebut dapat menawarkan tautan tambahan ke Skill Manager yang langsung menampilkan semua video untuk komponen yang terpasang – tanpa kami memerlukan akses ke aplikasi servis. Tautan hanya perlu dibuat seperti ini:",
    ms: "Jika peranti sudah mempunyai TAG sendiri (kod QR atau cip NFC) melalui aplikasi servis, aplikasi itu boleh menawarkan pautan tambahan ke Skill Manager yang terus menunjukkan semua video untuk bahagian yang dipasang – tanpa kami memerlukan akses ke aplikasi servis. Pautan hanya perlu dibina seperti ini:",
    af: "As 'n toestel reeds sy eie TAG (QR-kode of NFC-skyfie) via die diens-app het, kan daardie app benewens die toestelkonfigurasie 'n bykomende skakel na Skill Manager bied wat direk alle video's vir die geïnstalleerde onderdele wys – sonder dat ons toegang tot die diens-app benodig. Die skakel hoef net so gebou te word:",
  },
  "admin.qrTagText2": {
    de: "Die Teilenummern (Komma-getrennt, ohne Leerzeichen) sind die gleichen wie hier bei „Kategorien & Teile“ hinterlegt. „geraet=“ ist optional und nur eine Überschrift auf der Seite. Diesen Link-Aufbau kannst du an die Verantwortlichen der Service-App weitergeben, damit sie dort einen Button „Videos ansehen“ einbauen.",
    en: "The part numbers (comma-separated, no spaces) are the same as stored here under \"Categories & Parts\". \"geraet=\" is optional and just a heading on the page. You can pass this link structure on to those responsible for the service app so they can build in a \"View videos\" button there.",
    es: "Los números de pieza (separados por comas, sin espacios) son los mismos que aquí en \"Categorías y piezas\". \"geraet=\" es opcional y solo un título en la página. Puedes pasar esta estructura de enlace a los responsables de la app de servicio para que integren un botón \"Ver videos\".",
    pt: "Os números de peça (separados por vírgula, sem espaços) são os mesmos armazenados aqui em \"Categorias e peças\". \"geraet=\" é opcional e apenas um título na página. Você pode repassar essa estrutura de link aos responsáveis pelo app de serviço para que criem um botão \"Ver vídeos\".",
    sv: "Artikelnumren (kommaseparerade, utan mellanslag) är desamma som lagras här under \"Kategorier & delar\". \"geraet=\" är valfritt och bara en rubrik på sidan. Du kan vidarebefordra denna länkstruktur till de ansvariga för serviceappen så att de bygger in en \"Visa videor\"-knapp där.",
    fi: "Osanumerot (pilkulla erotettuina, ilman välilyöntejä) ovat samat kuin täällä kohdassa \"Kategoriat ja osat\". \"geraet=\" on valinnainen ja vain sivun otsikko. Voit välittää tämän linkkirakenteen huoltosovelluksesta vastaaville, jotta he rakentavat sinne \"Katso videot\" -painikkeen.",
    zh: "零件号（逗号分隔，无空格）与此处“分类与零件”中保存的相同。“geraet=”是可选的，仅作为页面标题。你可以将此链接结构提供给服务应用的负责人，以便他们在其中添加“查看视频”按钮。",
    ja: "部品番号（カンマ区切り、スペースなし）は、こちらの「カテゴリーと部品」に登録されているものと同じです。「geraet=」は任意で、ページの見出しにすぎません。このリンク構造をサービスアプリの担当者に伝えれば、そちらに「動画を見る」ボタンを組み込めます。",
    id: "Nomor komponen (dipisahkan koma, tanpa spasi) sama dengan yang tersimpan di \"Kategori & Komponen\". \"geraet=\" bersifat opsional dan hanya judul pada halaman. Anda dapat menyampaikan struktur tautan ini kepada penanggung jawab aplikasi servis agar mereka membuat tombol \"Lihat video\" di sana.",
    ms: "Nombor bahagian (dipisahkan koma, tanpa ruang) adalah sama seperti yang disimpan di sini di bawah \"Kategori & Bahagian\". \"geraet=\" adalah pilihan dan hanya tajuk pada halaman. Anda boleh sampaikan struktur pautan ini kepada penanggungjawab aplikasi servis supaya mereka membina butang \"Lihat video\" di sana.",
    af: "Die onderdeelnommers (kommageskei, geen spasies) is dieselfde as hier onder \"Kategorieë & onderdele\" gestoor. \"geraet=\" is opsioneel en net 'n opskrif op die bladsy. Jy kan hierdie skakelstruktuur aan die verantwoordelikes van die diens-app deurgee sodat hulle daar 'n \"Bekyk video's\"-knoppie inbou.",
  },
  "admin.teilAnfragenTitel": {
    de: "„Teil nicht gefunden“-Meldungen", en: "\"Part Not Found\" Reports", es: "Reportes de \"pieza no encontrada\"", pt: "Relatórios de \"peça não encontrada\"", sv: "\"Del hittades inte\"-anmälningar",
    fi: "\"Osaa ei löytynyt\" -ilmoitukset", zh: "“找不到零件”报告", ja: "「部品が見つかりません」報告", id: "Laporan \"Komponen tidak ditemukan\"", ms: "Laporan \"Bahagian tidak dijumpai\"", af: "\"Onderdeel nie gevind nie\"-verslae",
  },
  "admin.teilAnfragenUntertitel": {
    de: "Rückmeldungen von Technikern, die ein Teil nicht finden konnten.",
    en: "Feedback from technicians who couldn't find a part.",
    es: "Comentarios de técnicos que no pudieron encontrar una pieza.",
    pt: "Feedback de técnicos que não conseguiram encontrar uma peça.",
    sv: "Återkoppling från tekniker som inte kunde hitta en del.",
    fi: "Palautetta teknikoilta, jotka eivät löytäneet osaa.",
    zh: "来自找不到零件的技术人员的反馈。",
    ja: "部品が見つからなかった技術者からのフィードバック。",
    id: "Umpan balik dari teknisi yang tidak dapat menemukan komponen.",
    ms: "Maklum balas daripada juruteknik yang tidak dapat mencari bahagian.",
    af: "Terugvoer van tegnici wat 'n onderdeel nie kon vind nie.",
  },
  "admin.teilAnfragenLeer": {
    de: "Aktuell keine offenen Meldungen.", en: "No open reports right now.", es: "No hay reportes pendientes.", pt: "Nenhum relatório pendente.", sv: "Inga öppna anmälningar just nu.",
    fi: "Ei avoimia ilmoituksia juuri nyt.", zh: "目前没有待处理的报告。", ja: "現在未処理の報告はありません。", id: "Tidak ada laporan terbuka saat ini.", ms: "Tiada laporan terbuka sekarang.", af: "Geen oop verslae tans nie.",
  },

  "adminVideoEditor.freigegebenHinweis": {
    de: "„{titel}“ wurde freigegeben und ist jetzt in der Videothek sichtbar.",
    en: "\"{titel}\" has been approved and is now visible in the video library.",
    es: "\"{titel}\" fue aprobado y ahora es visible en la videoteca.",
    pt: "\"{titel}\" foi aprovado e agora está visível na videoteca.",
    sv: "\"{titel}\" har godkänts och är nu synlig i videobiblioteket.",
    fi: "\"{titel}\" on hyväksytty ja näkyy nyt videokirjastossa.",
    zh: "“{titel}”已获批准，现已在视频库中可见。",
    ja: "「{titel}」は承認され、ビデオライブラリに表示されるようになりました。",
    id: "\"{titel}\" telah disetujui dan sekarang terlihat di perpustakaan video.",
    ms: "\"{titel}\" telah diluluskan dan kini kelihatan dalam perpustakaan video.",
    af: "\"{titel}\" is goedgekeur en is nou sigbaar in die videobiblioteek.",
  },
  "adminVideoEditor.hochgeladenAm": {
    de: "Hochgeladen am {datum}", en: "Uploaded on {datum}", es: "Subido el {datum}", pt: "Enviado em {datum}", sv: "Uppladdad {datum}",
    fi: "Ladattu {datum}", zh: "上传于{datum}", ja: "アップロード日：{datum}", id: "Diunggah pada {datum}", ms: "Dimuat naik pada {datum}", af: "Opgelaai op {datum}",
  },
  "adminVideoEditor.tagsLabel": {
    de: "Tags (Komma-getrennt)", en: "Tags (comma-separated)", es: "Etiquetas (separadas por comas)", pt: "Tags (separadas por vírgula)", sv: "Taggar (kommaseparerade)",
    fi: "Tunnisteet (pilkulla erotettuina)", zh: "标签（逗号分隔）", ja: "タグ（カンマ区切り）", id: "Tag (dipisahkan koma)", ms: "Tag (dipisahkan koma)", af: "Etikette (kommageskei)",
  },
  "adminVideoEditor.tagsPlatzhalter": {
    de: "z. B. Ventil, Dichtung, Wartung", en: "e.g. valve, seal, maintenance", es: "p. ej. válvula, sello, mantenimiento", pt: "ex.: válvula, vedação, manutenção", sv: "t.ex. ventil, tätning, underhåll",
    fi: "esim. venttiili, tiiviste, huolto", zh: "例如：阀门、密封、维护", ja: "例：バルブ、シール、メンテナンス", id: "contoh: katup, segel, perawatan", ms: "cth: injap, kedap, penyelenggaraan", af: "bv. klep, afdigting, onderhoud",
  },
  "adminVideoEditor.beschreibungLabel": {
    de: "Schritt-für-Schritt-Beschreibung", en: "Step-by-step description", es: "Descripción paso a paso", pt: "Descrição passo a passo", sv: "Steg-för-steg-beskrivning",
    fi: "Vaiheittainen kuvaus", zh: "分步说明", ja: "手順の説明", id: "Deskripsi langkah demi langkah", ms: "Penerangan langkah demi langkah", af: "Stap-vir-stap-beskrywing",
  },
  "adminVideoEditor.speichernButton": {
    de: "Änderungen speichern", en: "Save changes", es: "Guardar cambios", pt: "Salvar alterações", sv: "Spara ändringar",
    fi: "Tallenna muutokset", zh: "保存更改", ja: "変更を保存", id: "Simpan perubahan", ms: "Simpan perubahan", af: "Stoor veranderinge",
  },
  "adminVideoEditor.freigebenButton": {
    de: "Freigeben", en: "Approve", es: "Aprobar", pt: "Aprovar", sv: "Godkänn",
    fi: "Hyväksy", zh: "批准", ja: "承認", id: "Setujui", ms: "Luluskan", af: "Keur goed",
  },
  "adminVideoEditor.gibtFreiLaeuft": {
    de: "Gibt frei …", en: "Approving …", es: "Aprobando …", pt: "Aprovando …", sv: "Godkänner …",
    fi: "Hyväksytään …", zh: "批准中…", ja: "承認中…", id: "Menyetujui …", ms: "Meluluskan …", af: "Keur goed …",
  },
  "adminVideoEditor.gespeichert": {
    de: "Gespeichert.", en: "Saved.", es: "Guardado.", pt: "Salvo.", sv: "Sparat.",
    fi: "Tallennettu.", zh: "已保存。", ja: "保存しました。", id: "Disimpan.", ms: "Disimpan.", af: "Gestoor.",
  },
  "adminVideoEditor.fehlerFreigeben": {
    de: "Fehler beim Freigeben.", en: "Error while approving.", es: "Error al aprobar.", pt: "Erro ao aprovar.", sv: "Fel vid godkännande.",
    fi: "Virhe hyväksyttäessä.", zh: "批准时出错。", ja: "承認中にエラーが発生しました。", id: "Kesalahan saat menyetujui.", ms: "Ralat semasa meluluskan.", af: "Fout tydens goedkeuring.",
  },

  "loeschanfrage.bestaetigung": {
    de: "\"{titel}\" wirklich endgültig löschen? Das kann nicht rückgängig gemacht werden.",
    en: "Really permanently delete \"{titel}\"? This cannot be undone.",
    es: "¿Realmente eliminar \"{titel}\" de forma permanente? Esto no se puede deshacer.",
    pt: "Realmente excluir \"{titel}\" permanentemente? Isso não pode ser desfeito.",
    sv: "Ta verkligen bort \"{titel}\" permanent? Detta kan inte ångras.",
    fi: "Poistetaanko \"{titel}\" todella pysyvästi? Tätä ei voi peruuttaa.",
    zh: "确定要永久删除“{titel}”吗？此操作无法撤销。",
    ja: "本当に「{titel}」を完全に削除しますか？この操作は元に戻せません。",
    id: "Yakin ingin menghapus \"{titel}\" secara permanen? Ini tidak dapat dibatalkan.",
    ms: "Padam \"{titel}\" secara kekal? Ini tidak boleh dibuat asal.",
    af: "Wil jy \"{titel}\" regtig permanent verwyder? Dit kan nie ontdoen word nie.",
  },
  "loeschanfrage.ablehnen": {
    de: "Ablehnen", en: "Reject", es: "Rechazar", pt: "Rejeitar", sv: "Avslå",
    fi: "Hylkää", zh: "拒绝", ja: "却下", id: "Tolak", ms: "Tolak", af: "Wys af",
  },
  "loeschanfrage.endgueltigLoeschen": {
    de: "Endgültig löschen", en: "Delete permanently", es: "Eliminar permanentemente", pt: "Excluir permanentemente", sv: "Ta bort permanent",
    fi: "Poista pysyvästi", zh: "永久删除", ja: "完全に削除", id: "Hapus permanen", ms: "Padam kekal", af: "Verwyder permanent",
  },

  "nutzerListe.spalteNutzer": {
    de: "Nutzer", en: "User", es: "Usuario", pt: "Usuário", sv: "Användare",
    fi: "Käyttäjä", zh: "用户", ja: "ユーザー", id: "Pengguna", ms: "Pengguna", af: "Gebruiker",
  },
  "nutzerListe.spalteStandort": {
    de: "Standort", en: "Location", es: "Ubicación", pt: "Localização", sv: "Plats",
    fi: "Sijainti", zh: "地点", ja: "所在地", id: "Lokasi", ms: "Lokasi", af: "Ligging",
  },
  "nutzerListe.spalteRolle": {
    de: "Rolle", en: "Role", es: "Rol", pt: "Função", sv: "Roll",
    fi: "Rooli", zh: "角色", ja: "役割", id: "Peran", ms: "Peranan", af: "Rol",
  },
  "nutzerListe.spalteStatus": {
    de: "Status", en: "Status", es: "Estado", pt: "Status", sv: "Status",
    fi: "Tila", zh: "状态", ja: "ステータス", id: "Status", ms: "Status", af: "Status",
  },
  "nutzerListe.du": {
    de: "(du)", en: "(you)", es: "(tú)", pt: "(você)", sv: "(du)",
    fi: "(sinä)", zh: "（你）", ja: "（あなた）", id: "(kamu)", ms: "(anda)", af: "(jy)",
  },
  "nutzerListe.aktiv": {
    de: "Aktiv", en: "Active", es: "Activo", pt: "Ativo", sv: "Aktiv",
    fi: "Aktiivinen", zh: "启用", ja: "有効", id: "Aktif", ms: "Aktif", af: "Aktief",
  },
  "nutzerListe.deaktiviert": {
    de: "Deaktiviert", en: "Deactivated", es: "Desactivado", pt: "Desativado", sv: "Inaktiverad",
    fi: "Ei käytössä", zh: "已停用", ja: "無効", id: "Nonaktif", ms: "Tidak aktif", af: "Gedeaktiveer",
  },
  "nutzerListe.deaktivierenButton": {
    de: "Deaktivieren", en: "Deactivate", es: "Desactivar", pt: "Desativar", sv: "Inaktivera",
    fi: "Poista käytöstä", zh: "停用", ja: "無効化", id: "Nonaktifkan", ms: "Nyahaktifkan", af: "Deaktiveer",
  },
  "nutzerListe.reaktivierenButton": {
    de: "Reaktivieren", en: "Reactivate", es: "Reactivar", pt: "Reativar", sv: "Återaktivera",
    fi: "Aktivoi uudelleen", zh: "重新启用", ja: "再有効化", id: "Aktifkan kembali", ms: "Aktifkan semula", af: "Heraktiveer",
  },
  "nutzerListe.rolleGeaendert": {
    de: "Rolle von {name} geändert.", en: "Role for {name} changed.", es: "Rol de {name} cambiado.", pt: "Função de {name} alterada.", sv: "Roll för {name} ändrad.",
    fi: "Käyttäjän {name} rooli muutettu.", zh: "{name}的角色已更改。", ja: "{name}の役割を変更しました。", id: "Peran {name} diubah.", ms: "Peranan {name} ditukar.", af: "Rol van {name} verander.",
  },
  "nutzerListe.fehlerRolle": {
    de: "Fehler beim Ändern der Rolle.", en: "Error changing the role.", es: "Error al cambiar el rol.", pt: "Erro ao alterar a função.", sv: "Fel vid ändring av roll.",
    fi: "Virhe roolia muutettaessa.", zh: "更改角色时出错。", ja: "役割の変更中にエラーが発生しました。", id: "Kesalahan saat mengubah peran.", ms: "Ralat semasa menukar peranan.", af: "Fout tydens verandering van rol.",
  },
  "nutzerListe.statusGeaendertReaktiviert": {
    de: "{name} wurde reaktiviert.", en: "{name} has been reactivated.", es: "{name} fue reactivado.", pt: "{name} foi reativado.", sv: "{name} har återaktiverats.",
    fi: "{name} on aktivoitu uudelleen.", zh: "{name}已重新启用。", ja: "{name}を再有効化しました。", id: "{name} telah diaktifkan kembali.", ms: "{name} telah diaktifkan semula.", af: "{name} is heraktiveer.",
  },
  "nutzerListe.statusGeaendertDeaktiviert": {
    de: "{name} wurde deaktiviert.", en: "{name} has been deactivated.", es: "{name} fue desactivado.", pt: "{name} foi desativado.", sv: "{name} har inaktiverats.",
    fi: "{name} on poistettu käytöstä.", zh: "{name}已被停用。", ja: "{name}を無効化しました。", id: "{name} telah dinonaktifkan.", ms: "{name} telah dinyahaktifkan.", af: "{name} is gedeaktiveer.",
  },
  "nutzerListe.fehlerStatus": {
    de: "Fehler beim Ändern des Status.", en: "Error changing the status.", es: "Error al cambiar el estado.", pt: "Erro ao alterar o status.", sv: "Fel vid ändring av status.",
    fi: "Virhe tilaa muutettaessa.", zh: "更改状态时出错。", ja: "ステータスの変更中にエラーが発生しました。", id: "Kesalahan saat mengubah status.", ms: "Ralat semasa menukar status.", af: "Fout tydens verandering van status.",
  },

  "qrCodeListe.leer": {
    de: "Noch keine Teile angelegt.", en: "No parts created yet.", es: "Aún no se han creado piezas.", pt: "Ainda não há peças criadas.", sv: "Inga delar skapade än.",
    fi: "Ei vielä luotuja osia.", zh: "尚未创建零件。", ja: "まだ部品が作成されていません。", id: "Belum ada komponen dibuat.", ms: "Belum ada bahagian dicipta.", af: "Nog geen onderdele geskep nie.",
  },
  "qrCodeListe.alleDrucken": {
    de: "Alle drucken / als PDF speichern", en: "Print all / save as PDF", es: "Imprimir todo / guardar como PDF", pt: "Imprimir tudo / salvar como PDF", sv: "Skriv ut alla / spara som PDF",
    fi: "Tulosta kaikki / tallenna PDF:nä", zh: "全部打印/另存为PDF", ja: "すべて印刷／PDFとして保存", id: "Cetak semua / simpan sebagai PDF", ms: "Cetak semua / simpan sebagai PDF", af: "Druk alles / stoor as PDF",
  },
  "qrCodeListe.teilNr": {
    de: "Teil-Nr. {nummer}", en: "Part no. {nummer}", es: "N.º de pieza {nummer}", pt: "N.º da peça {nummer}", sv: "Artikelnr. {nummer}",
    fi: "Osanro {nummer}", zh: "零件号{nummer}", ja: "部品番号 {nummer}", id: "No. Komponen {nummer}", ms: "No. Bahagian {nummer}", af: "Onderdeelnr. {nummer}",
  },
  "qrCodeListe.alsPngHerunterladen": {
    de: "Als PNG herunterladen", en: "Download as PNG", es: "Descargar como PNG", pt: "Baixar como PNG", sv: "Ladda ner som PNG",
    fi: "Lataa PNG-muodossa", zh: "下载为PNG", ja: "PNGとしてダウンロード", id: "Unduh sebagai PNG", ms: "Muat turun sebagai PNG", af: "Laai af as PNG",
  },

  "teilAnfrageZeile.unbekannt": {
    de: "Unbekannt", en: "Unknown", es: "Desconocido", pt: "Desconhecido", sv: "Okänd",
    fi: "Tuntematon", zh: "未知", ja: "不明", id: "Tidak diketahui", ms: "Tidak diketahui", af: "Onbekend",
  },
  "teilAnfrageZeile.alsErledigtMarkieren": {
    de: "Als erledigt markieren", en: "Mark as done", es: "Marcar como hecho", pt: "Marcar como concluído", sv: "Markera som klar",
    fi: "Merkitse valmiiksi", zh: "标记为已完成", ja: "完了としてマーク", id: "Tandai selesai", ms: "Tandakan selesai", af: "Merk as voltooi",
  },

  "lernpfadErstellenForm.neuerLernpfad": {
    de: "Neuer Lernpfad", en: "New Learning Path", es: "Nueva ruta de aprendizaje", pt: "Nova trilha de aprendizagem", sv: "Nytt utbildningsspår",
    fi: "Uusi oppimispolku", zh: "新学习路径", ja: "新しい学習パス", id: "Jalur Pembelajaran Baru", ms: "Laluan Pembelajaran Baharu", af: "Nuwe leerpad",
  },
  "lernpfadErstellenForm.titelPlatzhalter": {
    de: "Titel, z. B. 'Neu bei HOSCH'", en: "Title, e.g. 'New at HOSCH'", es: "Título, p. ej. 'Nuevo en HOSCH'", pt: "Título, ex.: 'Novo na HOSCH'", sv: "Titel, t.ex. 'Ny på HOSCH'",
    fi: "Otsikko, esim. 'Uusi HOSCH:lla'", zh: "标题，例如“HOSCH新人入门”", ja: "タイトル、例：「HOSCH新人向け」", id: "Judul, mis. 'Baru di HOSCH'", ms: "Tajuk, cth. 'Baharu di HOSCH'", af: "Titel, bv. 'Nuut by HOSCH'",
  },
  "lernpfadErstellenForm.beschreibungPlatzhalter": {
    de: "Kurzbeschreibung (optional)", en: "Short description (optional)", es: "Descripción breve (opcional)", pt: "Descrição breve (opcional)", sv: "Kort beskrivning (valfritt)",
    fi: "Lyhyt kuvaus (valinnainen)", zh: "简短说明（可选）", ja: "簡単な説明（任意）", id: "Deskripsi singkat (opsional)", ms: "Penerangan ringkas (pilihan)", af: "Kort beskrywing (opsioneel)",
  },
  "lernpfadErstellenForm.anlegenButton": {
    de: "Lernpfad anlegen", en: "Create learning path", es: "Crear ruta de aprendizaje", pt: "Criar trilha de aprendizagem", sv: "Skapa utbildningsspår",
    fi: "Luo oppimispolku", zh: "创建学习路径", ja: "学習パスを作成", id: "Buat jalur pembelajaran", ms: "Cipta laluan pembelajaran", af: "Skep leerpad",
  },
  "lernpfadErstellenForm.angelegt": {
    de: "Lernpfad angelegt.", en: "Learning path created.", es: "Ruta de aprendizaje creada.", pt: "Trilha de aprendizagem criada.", sv: "Utbildningsspår skapat.",
    fi: "Oppimispolku luotu.", zh: "学习路径已创建。", ja: "学習パスを作成しました。", id: "Jalur pembelajaran dibuat.", ms: "Laluan pembelajaran dicipta.", af: "Leerpad geskep.",
  },
  "lernpfadErstellenForm.fehlerAnlegen": {
    de: "Fehler beim Anlegen.", en: "Error while creating.", es: "Error al crear.", pt: "Erro ao criar.", sv: "Fel vid skapande.",
    fi: "Virhe luotaessa.", zh: "创建时出错。", ja: "作成中にエラーが発生しました。", id: "Kesalahan saat membuat.", ms: "Ralat semasa mencipta.", af: "Fout tydens skepping.",
  },

  "lernpfadVerwaltung.videoHinzufuegenLabel": {
    de: "Video hinzufügen", en: "Add video", es: "Agregar video", pt: "Adicionar vídeo", sv: "Lägg till video",
    fi: "Lisää video", zh: "添加视频", ja: "動画を追加", id: "Tambah video", ms: "Tambah video", af: "Voeg video by",
  },
  "lernpfadVerwaltung.hinzufuegenButton": {
    de: "Hinzufügen", en: "Add", es: "Agregar", pt: "Adicionar", sv: "Lägg till",
    fi: "Lisää", zh: "添加", ja: "追加", id: "Tambah", ms: "Tambah", af: "Voeg by",
  },
  "lernpfadVerwaltung.fehlerHinzufuegen": {
    de: "Fehler beim Hinzufügen.", en: "Error while adding.", es: "Error al agregar.", pt: "Erro ao adicionar.", sv: "Fel vid tillägg.",
    fi: "Virhe lisättäessä.", zh: "添加时出错。", ja: "追加中にエラーが発生しました。", id: "Kesalahan saat menambahkan.", ms: "Ralat semasa menambah.", af: "Fout tydens byvoeging.",
  },
  "lernpfadVerwaltung.keineVideos": {
    de: "Noch keine Videos in diesem Lernpfad.", en: "No videos in this learning path yet.", es: "Aún no hay videos en esta ruta de aprendizaje.", pt: "Ainda não há vídeos nesta trilha de aprendizagem.", sv: "Inga videor i detta utbildningsspår än.",
    fi: "Ei vielä videoita tässä oppimispolussa.", zh: "该学习路径中尚无视频。", ja: "この学習パスにはまだ動画がありません。", id: "Belum ada video di jalur pembelajaran ini.", ms: "Belum ada video dalam laluan pembelajaran ini.", af: "Nog geen video's in hierdie leerpad nie.",
  },
  "lernpfadVerwaltung.nachOben": {
    de: "Nach oben verschieben", en: "Move up", es: "Mover hacia arriba", pt: "Mover para cima", sv: "Flytta upp",
    fi: "Siirrä ylös", zh: "上移", ja: "上に移動", id: "Pindahkan ke atas", ms: "Alih ke atas", af: "Skuif op",
  },
  "lernpfadVerwaltung.nachUnten": {
    de: "Nach unten verschieben", en: "Move down", es: "Mover hacia abajo", pt: "Mover para baixo", sv: "Flytta ner",
    fi: "Siirrä alas", zh: "下移", ja: "下に移動", id: "Pindahkan ke bawah", ms: "Alih ke bawah", af: "Skuif af",
  },
  "lernpfadVerwaltung.entfernenButton": {
    de: "Entfernen", en: "Remove", es: "Quitar", pt: "Remover", sv: "Ta bort",
    fi: "Poista", zh: "移除", ja: "削除", id: "Hapus", ms: "Alih keluar", af: "Verwyder",
  },
  "lernpfadVerwaltung.fehlerEntfernen": {
    de: "Fehler beim Entfernen.", en: "Error while removing.", es: "Error al quitar.", pt: "Erro ao remover.", sv: "Fel vid borttagning.",
    fi: "Virhe poistettaessa.", zh: "移除时出错。", ja: "削除中にエラーが発生しました。", id: "Kesalahan saat menghapus.", ms: "Ralat semasa mengalih keluar.", af: "Fout tydens verwydering.",
  },
  "lernpfadVerwaltung.fehlerVerschieben": {
    de: "Verschieben nicht möglich.", en: "Moving not possible.", es: "No es posible mover.", pt: "Não é possível mover.", sv: "Det går inte att flytta.",
    fi: "Siirto ei ole mahdollinen.", zh: "无法移动。", ja: "移動できません。", id: "Tidak dapat memindahkan.", ms: "Tidak boleh alih.", af: "Kan nie skuif nie.",
  },
  "lernpfadVerwaltung.loeschenBestaetigung": {
    de: "Diesen Lernpfad wirklich löschen? Die Videos selbst bleiben erhalten.",
    en: "Really delete this learning path? The videos themselves remain.",
    es: "¿Realmente eliminar esta ruta de aprendizaje? Los videos en sí se conservan.",
    pt: "Realmente excluir esta trilha de aprendizagem? Os próprios vídeos permanecem.",
    sv: "Ta verkligen bort detta utbildningsspår? Videorna själva finns kvar.",
    fi: "Poistetaanko tämä oppimispolku todella? Videot itsessään säilyvät.",
    zh: "确定要删除该学习路径吗？视频本身会保留。",
    ja: "この学習パスを本当に削除しますか？動画自体は残ります。",
    id: "Yakin ingin menghapus jalur pembelajaran ini? Video itu sendiri tetap ada.",
    ms: "Padam laluan pembelajaran ini? Video itu sendiri akan kekal.",
    af: "Wil jy hierdie leerpad regtig verwyder? Die video's self bly bestaan.",
  },
  "lernpfadVerwaltung.fehlerLoeschen": {
    de: "Fehler beim Löschen.", en: "Error while deleting.", es: "Error al eliminar.", pt: "Erro ao excluir.", sv: "Fel vid borttagning.",
    fi: "Virhe poistettaessa.", zh: "删除时出错。", ja: "削除中にエラーが発生しました。", id: "Kesalahan saat menghapus.", ms: "Ralat semasa memadam.", af: "Fout tydens verwydering.",
  },
  "lernpfadVerwaltung.komplettLoeschenButton": {
    de: "Lernpfad komplett löschen", en: "Delete learning path completely", es: "Eliminar ruta de aprendizaje por completo", pt: "Excluir trilha de aprendizagem completamente", sv: "Ta bort utbildningsspåret helt",
    fi: "Poista oppimispolku kokonaan", zh: "彻底删除学习路径", ja: "学習パスを完全に削除", id: "Hapus jalur pembelajaran sepenuhnya", ms: "Padam laluan pembelajaran sepenuhnya", af: "Verwyder leerpad heeltemal",
  },

  "kategorieVerwaltung.teileInDieserKategorie": {
    de: "Teile in dieser Kategorie", en: "Parts in this category", es: "Piezas en esta categoría", pt: "Peças nesta categoria", sv: "Delar i denna kategori",
    fi: "Tämän kategorian osat", zh: "该分类下的零件", ja: "このカテゴリーの部品", id: "Komponen dalam kategori ini", ms: "Bahagian dalam kategori ini", af: "Onderdele in hierdie kategorie",
  },
  "kategorieVerwaltung.keineTeileInKategorie": {
    de: "Noch keine Teile in dieser Kategorie.", en: "No parts in this category yet.", es: "Aún no hay piezas en esta categoría.", pt: "Ainda não há peças nesta categoria.", sv: "Inga delar i denna kategori än.",
    fi: "Ei vielä osia tässä kategoriassa.", zh: "该分类下尚无零件。", ja: "このカテゴリーにはまだ部品がありません。", id: "Belum ada komponen dalam kategori ini.", ms: "Belum ada bahagian dalam kategori ini.", af: "Nog geen onderdele in hierdie kategorie nie.",
  },
  "kategorieVerwaltung.erstDarueberAuswaehlen": {
    de: "Erst darüber auswählen.", en: "Select the level above first.", es: "Selecciona primero el nivel superior.", pt: "Selecione primeiro o nível acima.", sv: "Välj nivån ovanför först.",
    fi: "Valitse ensin ylempi taso.", zh: "请先选择上一级。", ja: "まず上のレベルを選択してください。", id: "Pilih tingkat di atasnya dahulu.", ms: "Pilih peringkat di atas dahulu.", af: "Kies eers die vlak daarbo.",
  },
  "kategorieVerwaltung.nochNichtsAngelegt": {
    de: "Noch nichts angelegt.", en: "Nothing created yet.", es: "Aún no se ha creado nada.", pt: "Ainda nada criado.", sv: "Inget skapat än.",
    fi: "Ei vielä mitään luotua.", zh: "尚未创建任何内容。", ja: "まだ何も作成されていません。", id: "Belum ada yang dibuat.", ms: "Belum ada yang dicipta.", af: "Nog niks geskep nie.",
  },
  "kategorieVerwaltung.neuPlatzhalter": {
    de: "Neu…", en: "New…", es: "Nuevo…", pt: "Novo…", sv: "Ny…",
    fi: "Uusi…", zh: "新建…", ja: "新規…", id: "Baru…", ms: "Baharu…", af: "Nuut…",
  },
  "kategorieVerwaltung.refTitle": {
    de: "Zeigt Referenzvideo-Zusatzfelder (Material, Geschwindigkeit, ...)",
    en: "Shows reference video extra fields (material, speed, ...)",
    es: "Muestra campos adicionales de video de referencia (material, velocidad, ...)",
    pt: "Mostra campos adicionais de vídeo de referência (material, velocidade, ...)",
    sv: "Visar extrafält för referensvideo (material, hastighet, ...)",
    fi: "Näyttää referenssivideon lisäkentät (materiaali, nopeus, ...)",
    zh: "显示参考视频附加字段（材料、速度等）",
    ja: "リファレンス動画の追加項目を表示（素材、速度など）",
    id: "Menampilkan bidang tambahan video referensi (material, kecepatan, ...)",
    ms: "Menunjukkan medan tambahan video rujukan (bahan, kelajuan, ...)",
    af: "Wys bykomende verwysingsvideo-velde (materiaal, spoed, ...)",
  },
  "kategorieVerwaltung.refLabel": {
    de: "Ref.", en: "Ref.", es: "Ref.", pt: "Ref.", sv: "Ref.",
    fi: "Ref.", zh: "参考", ja: "参照", id: "Ref.", ms: "Ruj.", af: "Verw.",
  },
  "kategorieVerwaltung.zeigtReferenzfelder": {
    de: "Zeigt Referenzvideo-Zusatzfelder", en: "Shows reference video extra fields", es: "Muestra campos adicionales de video de referencia", pt: "Mostra campos adicionais de vídeo de referência", sv: "Visar extrafält för referensvideo",
    fi: "Näyttää referenssivideon lisäkentät", zh: "显示参考视频附加字段", ja: "リファレンス動画の追加項目を表示", id: "Menampilkan bidang tambahan video referensi", ms: "Menunjukkan medan tambahan video rujukan", af: "Wys bykomende verwysingsvideo-velde",
  },
  "kategorieVerwaltung.fehlerAnlegen": {
    de: "Fehler beim Anlegen.", en: "Error while creating.", es: "Error al crear.", pt: "Erro ao criar.", sv: "Fel vid skapande.",
    fi: "Virhe luotaessa.", zh: "创建时出错。", ja: "作成中にエラーが発生しました。", id: "Kesalahan saat membuat.", ms: "Ralat semasa mencipta.", af: "Fout tydens skepping.",
  },
  "kategorieVerwaltung.neuenTeilAnlegen": {
    de: "Neuen Teil anlegen", en: "Create new part", es: "Crear nueva pieza", pt: "Criar nova peça", sv: "Skapa ny del",
    fi: "Luo uusi osa", zh: "创建新零件", ja: "新しい部品を作成", id: "Buat komponen baru", ms: "Cipta bahagian baharu", af: "Skep nuwe onderdeel",
  },
  "kategorieVerwaltung.nameDesTeils": {
    de: "Name des Teils", en: "Part name", es: "Nombre de la pieza", pt: "Nome da peça", sv: "Delens namn",
    fi: "Osan nimi", zh: "零件名称", ja: "部品名", id: "Nama komponen", ms: "Nama bahagian", af: "Naam van onderdeel",
  },
  "kategorieVerwaltung.idNr": {
    de: "ID-Nr.", en: "ID no.", es: "N.º de ID", pt: "N.º de ID", sv: "ID-nr.",
    fi: "ID-nro", zh: "编号", ja: "ID番号", id: "No. ID", ms: "No. ID", af: "ID-nr.",
  },
  "kategorieVerwaltung.beschreibung": {
    de: "Beschreibung", en: "Description", es: "Descripción", pt: "Descrição", sv: "Beskrivning",
    fi: "Kuvaus", zh: "描述", ja: "説明", id: "Deskripsi", ms: "Penerangan", af: "Beskrywing",
  },
  "kategorieVerwaltung.teilAnlegenButton": {
    de: "Teil anlegen", en: "Create part", es: "Crear pieza", pt: "Criar peça", sv: "Skapa del",
    fi: "Luo osa", zh: "创建零件", ja: "部品を作成", id: "Buat komponen", ms: "Cipta bahagian", af: "Skep onderdeel",
  },
};
