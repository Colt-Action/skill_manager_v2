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
};
