const CONFIG = {
    background: {
        type: 'video',
        videoUrl: 'background.mp4',
        gifUrl: 'https://media3.giphy.com/media/v1.Y2lkPTc5MGI3NjExNjB4dm42bXo2NzU3eXQ3eWVrY3luMXpmNmF0Nzh1c3c1N3czeWYwOSZlcD12MV9pbnRlcm5hbF9naWZfYnlfaWQmY3Q9Zw/wdmRjR6i5clmHDTDEw/giphy.gif',
        overlayOpacity: 0.6,
        blur: '2px'
    },
    music: {
        enabled: true,
        volume: 0.5,
        autoplay: true,
        loop: true,
        showVisualizer: true,
        songs: [
            { name: 'DOPAMINE HIT', artist: 'ALRT,ELLIOTT', url: 'dopamine.mp3', cover: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTS2eE-QMDUE2STITd6ampD_GrGlRs8g4gOjops5QJzcw&s' }
        ]
    },
    profile: {
        name: 'NotChauBau',
        bio: 'REGGIN • Developer • YAG',
        // Start with a placeholder to confirm it works, then replace with your GIF
        avatarUrl: 'https://shared.fastly.steamstatic.com/community_assets/images/items/1684100/c90b6d40f26a8f9076c5715853fd70dfa84c7428.gif',
        badges: ['🎮 Gamer', '💻 Developer']
    },
    discord: {
        useLanyard: true,
        lanyardUserId: '845268743558398002'
    },
    links: [
        { name: 'Steam', url: 'https://steamcommunity.com/profiles/76561199422930739/', icon: '🎮', class: 'steam' },
        { name: 'Instagram', url: 'https://www.instagram.com/chau_bau001?igsh=NHZ2NjVnZWNyMTVn&utm_source=qr', icon: '📸', class: 'instagram' },
        { name: 'GitHub', url: 'https://github.com/PrivateUser142', icon: '💻', class: 'github' },
        { name: 'YouTube', url: 'https://www.youtube.com/watch?v=U67mf4sRM_Y', icon: '📺', class: 'youtube' },
    ],
    settings: { refreshInterval: 10000, debug: true }
};