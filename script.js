class LinkHub {
    constructor(config) {
        this.config = config;
        this.spotifyInterval = null;
        this.currentSongIndex = 0;
        this.audio = null;
        this.visualizerInterval = null;
        this.init();
    }

    init() {
        console.log('🚀 Starting...');
        this.setupBackground();
        this.setupWelcomeScreen();
        this.setupProfile();
        this.setupLinks();
        this.setupMusicPlayer();
        this.startLanyard();
        console.log('✅ Ready!');
    }

    // ---------- Welcome Screen ----------
    setupWelcomeScreen() {
        const welcomeScreen = document.getElementById('welcomeScreen');
        const enterBtn = document.getElementById('enterBtn');
        if (!welcomeScreen || !enterBtn) return;
        
        const enterSite = () => {
            welcomeScreen.classList.add('hide');
            this.startMusic();
            setTimeout(() => {
                if (welcomeScreen.parentNode) welcomeScreen.parentNode.removeChild(welcomeScreen);
            }, 600);
        };
        
        enterBtn.addEventListener('click', enterSite);
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !welcomeScreen.classList.contains('hide')) enterSite();
        });
    }

    startMusic() {
        if (!this.audio || !this.config.music.enabled) return;
        this.audio.play().then(() => {
            console.log('🎵 Music started');
            this.updatePlayButton();
            this.startVisualizer();
        }).catch(err => console.log('❌ Music play failed:', err));
    }

    // ---------- Background ----------
    setupBackground() {
        const container = document.getElementById('bgContainer');
        if (!container) return;
        container.innerHTML = '';

        if (this.config.background.type === 'video') {
            container.innerHTML = `
                <video autoplay muted loop playsinline style="width:100%;height:100%;object-fit:cover;">
                    <source src="${this.config.background.videoUrl}" type="video/mp4">
                </video>
                <img src="${this.config.background.gifUrl}" style="display:none;width:100%;height:100%;object-fit:cover;" id="bgFallback">
            `;
            const video = container.querySelector('video');
            const fallback = container.querySelector('#bgFallback');
            if (video) {
                video.addEventListener('error', () => { fallback.style.display = 'block'; video.style.display = 'none'; });
                video.play().catch(() => { fallback.style.display = 'block'; video.style.display = 'none'; });
            }
        } else {
            container.innerHTML = `<img src="${this.config.background.gifUrl}" style="width:100%;height:100%;object-fit:cover;" onerror="this.parentElement.style.background='linear-gradient(135deg, #667eea, #764ba2)'">`;
        }
    }

    // ---------- Profile (AVATAR FIX) ----------
    setupProfile() {
        // Text & badges
        document.getElementById('profileName').textContent = this.config.profile.name;
        document.getElementById('profileBio').textContent = this.config.profile.bio;
        document.getElementById('profileBadges').innerHTML = this.config.profile.badges
            .map(b => `<span class="badge">${b}</span>`).join('');

        // Directly set the three avatar elements
        const avatarUrl = this.config.profile.avatarUrl;
        const fallback = 'https://via.placeholder.com/120';

        const setAvatar = (id, fallbackUrl = fallback) => {
            const img = document.getElementById(id);
            if (img) {
                console.log(`🖼️ Setting avatar for #${id} to ${avatarUrl}`);
                img.src = avatarUrl;
                img.onerror = () => {
                    console.warn(`⚠️ Failed to load ${avatarUrl} for #${id}, using fallback`);
                    img.src = fallbackUrl;
                    img.onerror = null; // prevent infinite loop
                };
            } else {
                console.warn(`❌ Element #${id} not found`);
            }
        };

        setAvatar('profileImage');       // big circle on main page
        setAvatar('welcomeAvatarImg');   // welcome screen
        setAvatar('discordAvatar', 'https://cdn.discordapp.com/embed/avatars/0.png');
    }

    // ---------- Links ----------
    setupLinks() {
        document.getElementById('linksContainer').innerHTML = this.config.links.map(link => `
            <a href="${link.url}" class="link-item ${link.class}" target="_blank" rel="noopener noreferrer">
                <span class="link-icon">${link.icon}</span>${link.name}
            </a>`).join('');
    }

    // ---------- Music Player ----------
    setupMusicPlayer() {
        if (!this.config.music.enabled) {
            document.getElementById('musicPlayer').style.display = 'none';
            return;
        }

        this.audio = new Audio();
        this.audio.volume = this.config.music.volume;
        this.audio.loop = this.config.music.loop;
        this.audio.preload = 'auto';
        this.loadSong(this.currentSongIndex);
        this.setupMusicControls();
        this.updateMusicDisplay();
    }

    loadSong(index) {
        if (!this.audio || !this.config.music.songs[index]) return;
        this.audio.src = this.config.music.songs[index].url;
        this.audio.load();
    }

    setupMusicControls() {
        document.getElementById('playBtn').addEventListener('click', () => {
            this.audio.paused ? this.audio.play().then(() => this.startVisualizer()) : this.audio.pause();
            this.updatePlayButton();
            if (this.audio.paused) this.stopVisualizer();
        });
        document.getElementById('prevBtn').addEventListener('click', () => {
            this.currentSongIndex = (this.currentSongIndex - 1 + this.config.music.songs.length) % this.config.music.songs.length;
            this.loadSong(this.currentSongIndex);
            this.audio.play().then(() => this.startVisualizer());
            this.updatePlayButton(); this.updateMusicDisplay();
        });
        document.getElementById('nextBtn').addEventListener('click', () => {
            this.currentSongIndex = (this.currentSongIndex + 1) % this.config.music.songs.length;
            this.loadSong(this.currentSongIndex);
            this.audio.play().then(() => this.startVisualizer());
            this.updatePlayButton(); this.updateMusicDisplay();
        });

        const volumeSlider = document.getElementById('volumeSlider');
        volumeSlider.value = this.audio.volume * 100;
        volumeSlider.addEventListener('input', (e) => { this.audio.volume = e.target.value / 100; this.updateVolumeIcon(); });
        document.getElementById('volumeIcon').addEventListener('click', () => {
            this.audio.volume = this.audio.volume > 0 ? 0 : 0.5;
            volumeSlider.value = this.audio.volume * 100;
            this.updateVolumeIcon();
        });
        document.getElementById('musicProgress').addEventListener('click', (e) => {
            if (!this.audio.duration) return;
            const rect = e.target.getBoundingClientRect();
            this.audio.currentTime = ((e.clientX - rect.left) / rect.width) * this.audio.duration;
        });
        this.audio.addEventListener('timeupdate', () => this.updateProgress());
        this.audio.addEventListener('ended', () => { if (this.config.music.songs.length > 1) this.nextSong(); });
        document.getElementById('musicToggle').addEventListener('click', () => {
            document.getElementById('musicBody').classList.toggle('collapsed');
            document.getElementById('musicToggle').classList.toggle('open');
        });
    }

    updatePlayButton() {
        document.getElementById('playBtn').textContent = this.audio.paused ? '▶️' : '⏸️';
        const cover = document.getElementById('musicCover');
        if (cover) cover.classList.toggle('playing', !this.audio.paused);
    }

    updateProgress() {
        if (!this.audio.duration) return;
        document.getElementById('musicProgressBar').style.width = (this.audio.currentTime / this.audio.duration) * 100 + '%';
        document.getElementById('currentTime').textContent = this.formatTime(this.audio.currentTime);
        document.getElementById('totalTime').textContent = this.formatTime(this.audio.duration);
    }

    updateVolumeIcon() {
        const vol = this.audio.volume;
        document.getElementById('volumeIcon').textContent = vol === 0 ? '🔇' : vol < 0.5 ? '🔉' : '🔊';
    }

    updateMusicDisplay() {
        const song = this.config.music.songs[this.currentSongIndex];
        if (!song) return;
        document.getElementById('musicSong').textContent = song.name;
        document.getElementById('musicArtist').textContent = song.artist;
        document.getElementById('musicCover').src = song.cover;
    }

    formatTime(seconds) {
        if (isNaN(seconds)) return '0:00';
        const min = Math.floor(seconds / 60);
        const sec = Math.floor(seconds % 60);
        return `${min}:${sec.toString().padStart(2, '0')}`;
    }

    startVisualizer() {
        if (!this.config.music.showVisualizer) return;
        this.stopVisualizer();
        const bars = document.querySelectorAll('.visualizer-bar');
        if (bars.length === 0) return;
        this.visualizerInterval = setInterval(() => {
            bars.forEach(bar => bar.style.height = (Math.random() * 25 + 3) + 'px');
        }, 100);
    }

    stopVisualizer() {
        if (this.visualizerInterval) clearInterval(this.visualizerInterval);
        document.querySelectorAll('.visualizer-bar').forEach(bar => bar.style.height = '2px');
    }

    nextSong() {
        this.currentSongIndex = (this.currentSongIndex + 1) % this.config.music.songs.length;
        this.loadSong(this.currentSongIndex);
        this.audio.play().then(() => this.startVisualizer());
        this.updatePlayButton(); this.updateMusicDisplay();
    }

    // ---------- Lanyard (Discord/Spotify) ----------
    startLanyard() {
        if (!this.config.discord.useLanyard || !this.config.discord.lanyardUserId || this.config.discord.lanyardUserId === 'YOUR_DISCORD_USER_ID') {
            this.setDefaultStatus();
            return;
        }
        this.fetchLanyard();
        setInterval(() => this.fetchLanyard(), this.config.settings.refreshInterval);
    }

    async fetchLanyard() {
        try {
            const res = await fetch(`https://api.lanyard.rest/v1/users/${this.config.discord.lanyardUserId}`);
            const data = await res.json();
            if (data.success) {
                this.updateDiscord(data.data);
                this.updateSpotify(data.data);
            }
        } catch (err) {
            console.log('❌ Lanyard error:', err);
        }
    }

    updateDiscord(data) {
        const { discord_user, discord_status, activities } = data;
        if (discord_user.avatar) {
            document.getElementById('discordAvatar').src = `https://cdn.discordapp.com/avatars/${discord_user.id}/${discord_user.avatar}.png?size=128`;
        }
        document.getElementById('discordUsername').textContent = discord_user.username;
        const statuses = {
            online: '<span class="status-dot online"></span> Online',
            idle: '<span class="status-dot idle"></span> Idle',
            dnd: '<span class="status-dot dnd"></span> Do Not Disturb',
            offline: '<span class="status-dot offline"></span> Offline'
        };
        document.getElementById('discordStatus').innerHTML = statuses[discord_status] || statuses.offline;
        let activity = 'No activity';
        if (activities?.length) {
            const game = activities.find(a => a.type === 0);
            if (game) {
                activity = `Playing ${game.name}`;
                if (game.details) activity += ` - ${game.details}`;
            }
        }
        document.getElementById('discordActivity').textContent = activity;
    }

    updateSpotify(data) {
        const content = document.getElementById('spotifyContent');
        if (data.spotify) {
            content.innerHTML = `<img src="${data.spotify.album_art_url}" alt="Album" class="spotify-album-art playing" onerror="this.src='https://via.placeholder.com/50'"><div class="spotify-info"><div class="spotify-song">${this.escape(data.spotify.song)}</div><div class="spotify-artist">by ${this.escape(data.spotify.artist)}</div></div>`;
        } else {
            content.innerHTML = '<div class="not-playing">🎵 Not listening to anything</div>';
        }
    }

    setDefaultStatus() {
        document.getElementById('discordUsername').textContent = 'davedown';
        document.getElementById('discordStatus').innerHTML = '<span class="status-dot online"></span> Online';
        document.getElementById('discordActivity').textContent = 'Playing Minecraft';
        document.getElementById('spotifyContent').innerHTML = '<div class="not-playing">🎵 Not listening to anything</div>';
    }

    escape(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }
}

// Start the app
document.addEventListener('DOMContentLoaded', () => {
    window.linkHub = new LinkHub(CONFIG);
});