import json
import os
import pandas as pd
import networkx as nx

# Paths
base_dir = r"E:\Recoza\backend\data"
toys_meta_path = os.path.join(base_dir, "toys_metadata.json")
toys_interactions_path = os.path.join(base_dir, "toys_interactions.csv")
toys_comm_path = os.path.join(base_dir, "graph_communities_train.json")

with open(toys_meta_path, "r", encoding="utf-8") as f:
    toys_meta = json.load(f)

with open(toys_comm_path, "r", encoding="utf-8") as f:
    comm_data = json.load(f)

# Multi-domain catalog items to enrich Recoza
NEW_ITEMS = [
    # ── 1. Laptops & Portable Computing (Community 14) ──
    {
        "parent_asin": "LAP_MBA_M1",
        "title": "Apple MacBook Air 13.3-inch (Apple M1 chip, 8GB Unified RAM, 256GB SSD, Retina Display, Backlit Magic Keyboard, 18hr Battery, Space Grey)",
        "category": "Laptops & Computers",
        "store": "Apple",
        "average_rating": 4.8,
        "rating_number": 19450,
        "price": 69990.0,
        "price_currency": "INR",
        "price_formatted": "₹69,990",
        "image_url": "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=800&q=80",
        "specs": "Apple M1 8-Core CPU | 8GB Unified RAM | 256GB SSD | 1.29 kg | macOS Sonoma | 18-hr Battery",
        "description": "Ultra-lightweight aluminum powerhouse ideal for programming, web development, and daily multitasking with silent fanless thermal design and all-day battery life."
    },
    {
        "parent_asin": "LAP_ASUS_ZEN14",
        "title": "ASUS ZenBook 14 OLED Ultra-Slim Laptop (Intel Core Ultra 5 125H, 16GB LPDDR5X RAM, 512GB NVMe SSD, 14-inch 2.8K 90Hz OLED, 1.2kg, Ponder Blue)",
        "category": "Laptops & Computers",
        "store": "ASUS",
        "average_rating": 4.6,
        "rating_number": 3820,
        "price": 68990.0,
        "price_currency": "INR",
        "price_formatted": "₹68,990",
        "image_url": "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=800&q=80",
        "specs": "Intel Core Ultra 5 125H (14-Core) | 16GB LPDDR5X | 512GB SSD | 14\" 2.8K OLED 90Hz | 1.2 kg",
        "description": "Premium ultraportable developer notebook featuring a gorgeous 2.8K OLED display, Evo-certified AI acceleration, and 16GB RAM for smooth IDE compilation and multitasking under ₹70,000."
    },
    {
        "parent_asin": "LAP_THINKPAD_E14",
        "title": "Lenovo ThinkPad E14 Gen 5 (AMD Ryzen 5 7530U, 16GB DDR4 RAM, 512GB PCIe SSD, 14-inch WUXGA IPS Antiglare, Backlit Keyboard, Fingerprint Reader, Black)",
        "category": "Laptops & Computers",
        "store": "Lenovo",
        "average_rating": 4.7,
        "rating_number": 6120,
        "price": 58990.0,
        "price_currency": "INR",
        "price_formatted": "₹58,990",
        "image_url": "https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=800&q=80",
        "specs": "AMD Ryzen 5 7530U (6-Core/12-Thread) | 16GB RAM | 512GB SSD | 14\" WUXGA IPS | TrackPoint | 1.41 kg",
        "description": "Renowned for its tactile ergonomic keyboard and military-grade durability, this ThinkPad is an exceptional programming machine offering dual SODIMM expandability and robust Linux compatibility."
    },
    {
        "parent_asin": "LAP_ACER_SWIFT_GO",
        "title": "Acer Swift Go 14 Ultra-Thin Laptop (Intel Core i5-13500H 12-Core, 16GB LPDDR5, 512GB SSD, 14-inch 90Hz OLED 2.8K, Intel Evo, 1.25kg, Pure Silver)",
        "category": "Laptops & Computers",
        "store": "Acer",
        "average_rating": 4.5,
        "rating_number": 2980,
        "price": 59990.0,
        "price_currency": "INR",
        "price_formatted": "₹59,990",
        "image_url": "https://images.unsplash.com/photo-1525547719571-a2d4ac8945e2?auto=format&fit=crop&w=800&q=80",
        "specs": "Intel Core i5-13500H | 16GB LPDDR5 | 512GB SSD | 14\" OLED 2.8K 90Hz | Dual Thunderbolt 4 | 1.25 kg",
        "description": "Punchy H-series 12-core processor paired with dual fan cooling, 100% DCI-P3 OLED color accuracy, and dual Thunderbolt 4 ports for docking multiple external monitors."
    },
    {
        "parent_asin": "LAP_HP_AERO13",
        "title": "HP Pavilion Aero 13 (AMD Ryzen 5 7535U, 16GB LPDDR5 RAM, 512GB SSD, 13.3-inch WQXGA IPS 400 nits, Under 1kg Magnesium Body, Natural Silver)",
        "category": "Laptops & Computers",
        "store": "HP",
        "average_rating": 4.6,
        "rating_number": 4150,
        "price": 64990.0,
        "price_currency": "INR",
        "price_formatted": "₹64,990",
        "image_url": "https://images.unsplash.com/photo-1541807084-5c52b6b3adef?auto=format&fit=crop&w=800&q=80",
        "specs": "AMD Ryzen 5 7535U | 16GB RAM | 512GB SSD | 13.3\" WQXGA 16:10 400 nits | 970 grams",
        "description": "Weighing only 970 grams, the Pavilion Aero 13 is one of the lightest productivity laptops on the market, featuring a sharp 16:10 display and speedy 6-core processing for mobile coding."
    },
    {
        "parent_asin": "LAP_DELL_INSP14",
        "title": "Dell Inspiron 14 5430 Laptop (13th Gen Intel Core i5-1335U, 16GB LPDDR5 RAM, 512GB NVMe SSD, 14-inch FHD+ Display, Backlit Keyboard, Platinum Silver)",
        "category": "Laptops & Computers",
        "store": "Dell",
        "average_rating": 4.5,
        "rating_number": 3210,
        "price": 66490.0,
        "price_currency": "INR",
        "price_formatted": "₹66,490",
        "image_url": "https://images.unsplash.com/photo-1593642702821-c8da6771f0c6?auto=format&fit=crop&w=800&q=80",
        "specs": "13th Gen Intel Core i5-1335U | 16GB LPDDR5 | 512GB SSD | 14\" FHD+ 16:10 | 1.5 kg",
        "description": "Balanced, durable workhorse laptop with Dell ExpressCharge, crisp audio, full-size HDMI, and high reliability for engineering coursework and remote work."
    },
    {
        "parent_asin": "LAP_MBA_M2",
        "title": "Apple MacBook Air 13.6-inch (Apple M2 chip, 8GB Unified RAM, 256GB SSD, Liquid Retina Display, MagSafe 3, 1080p FaceTime HD Camera, Midnight)",
        "category": "Laptops & Computers",
        "store": "Apple",
        "average_rating": 4.9,
        "rating_number": 28400,
        "price": 89900.0,
        "price_currency": "INR",
        "price_formatted": "₹89,900",
        "image_url": "https://images.unsplash.com/photo-1611186871348-b1ce696e52c9?auto=format&fit=crop&w=800&q=80",
        "specs": "Apple M2 8-Core CPU / 8-Core GPU | 8GB Unified RAM | 256GB SSD | 13.6\" Liquid Retina | 1.24 kg",
        "description": "Modern redesign featuring slender 11.3mm profile, dedicated MagSafe charging port, vibrant 500-nit Liquid Retina screen, and remarkable M2 performance."
    },
    {
        "parent_asin": "LAP_LENOVO_SLIM5",
        "title": "Lenovo IdeaPad Slim 5 (AMD Ryzen 5 7530U, 16GB DDR4 RAM, 512GB PCIe SSD, 14-inch WUXGA IPS 300 nits, FHD Camera with Privacy Shutter, Cloud Grey)",
        "category": "Laptops & Computers",
        "store": "Lenovo",
        "average_rating": 4.4,
        "rating_number": 2450,
        "price": 52990.0,
        "price_currency": "INR",
        "price_formatted": "₹52,990",
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        "specs": "AMD Ryzen 5 7530U | 16GB RAM | 512GB SSD | 14\" WUXGA IPS | 1.46 kg | Rapid Charge Boost",
        "description": "High value budget programming laptop delivering 16GB RAM, all-metal A/D cover, and strong thermal headroom under ₹55,000."
    },

    # ── 2. Movies, Cinema & Film (Community 15) ──
    {
        "parent_asin": "MOV_INCEPTION",
        "title": "Inception (2010 Film - Directed by Christopher Nolan, Starring Leonardo DiCaprio, Joseph Gordon-Levitt, Elliot Page)",
        "category": "Movies & Entertainment",
        "store": "Warner Bros. Pictures",
        "average_rating": 8.8,
        "rating_number": 2520000,
        "price": 499.0,
        "price_currency": "INR",
        "price_formatted": "₹499 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Sci-Fi / Action / Heist | Runtime: 148 min | IMDb: 8.8/10 | 4 Academy Awards",
        "description": "Dom Cobb is a skilled thief who steals valuable secrets from deep within the subconscious mind during the dream state. Given a chance at redemption, he must accomplish the impossible: plant an idea into a target's mind."
    },
    {
        "parent_asin": "MOV_INTERSTELLAR",
        "title": "Interstellar (2014 Film - Directed by Christopher Nolan, Starring Matthew McConaughey, Anne Hathaway, Jessica Chastain)",
        "category": "Movies & Entertainment",
        "store": "Paramount Pictures",
        "average_rating": 8.7,
        "rating_number": 2040000,
        "price": 499.0,
        "price_currency": "INR",
        "price_formatted": "₹499 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1506703719100-a0f3a48c0f86?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Sci-Fi / Adventure / Drama | Runtime: 169 min | IMDb: 8.7/10 | Academy Award for Visual Effects",
        "description": "When Earth becomes uninhabitable in the future, a team of astronauts travels through a wormhole near Saturn in search of a new home for mankind, exploring gravitational time dilation and the endurance of love."
    },
    {
        "parent_asin": "MOV_DARK_KNIGHT",
        "title": "The Dark Knight (2008 Film - Directed by Christopher Nolan, Starring Christian Bale, Heath Ledger, Aaron Eckhart)",
        "category": "Movies & Entertainment",
        "store": "Warner Bros. Pictures",
        "average_rating": 9.0,
        "rating_number": 2890000,
        "price": 499.0,
        "price_currency": "INR",
        "price_formatted": "₹499 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1509198397868-475647b2a1e5?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Action / Crime / Drama | Runtime: 152 min | IMDb: 9.0/10 | 2 Academy Awards",
        "description": "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice."
    },
    {
        "parent_asin": "MOV_DUNE_PART_TWO",
        "title": "Dune: Part Two (2024 Film - Directed by Denis Villeneuve, Starring Timothée Chalamet, Zendaya, Rebecca Ferguson)",
        "category": "Movies & Entertainment",
        "store": "Warner Bros. Pictures / Legendary",
        "average_rating": 8.6,
        "rating_number": 510000,
        "price": 599.0,
        "price_currency": "INR",
        "price_formatted": "₹599 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Sci-Fi / Adventure / Epic | Runtime: 166 min | IMDb: 8.6/10 | IMAX 70mm Presentation",
        "description": "Paul Atreides unites with Chani and the Fremen while seeking revenge against the conspirators who destroyed his family, facing a choice between the love of his life and the fate of the known universe."
    },
    {
        "parent_asin": "MOV_OPPENHEIMER",
        "title": "Oppenheimer (2023 Film - Directed by Christopher Nolan, Starring Cillian Murphy, Emily Blunt, Robert Downey Jr.)",
        "category": "Movies & Entertainment",
        "store": "Universal Pictures",
        "average_rating": 8.9,
        "rating_number": 780000,
        "price": 599.0,
        "price_currency": "INR",
        "price_formatted": "₹599 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1440404653325-ab127d49abc1?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Biography / Drama / History | Runtime: 180 min | IMDb: 8.9/10 | 7 Academy Awards (Best Picture)",
        "description": "The story of American scientist J. Robert Oppenheimer and his role in the development of the atomic bomb at Los Alamos during the Manhattan Project, exploring profound moral and political consequences."
    },
    {
        "parent_asin": "MOV_PARASITE",
        "title": "Parasite (2019 Film - Directed by Bong Joon-ho, Starring Song Kang-ho, Lee Sun-kyun, Cho Yeo-jeong)",
        "category": "Movies & Entertainment",
        "store": "CJ Entertainment / Neon",
        "average_rating": 8.5,
        "rating_number": 920000,
        "price": 399.0,
        "price_currency": "INR",
        "price_formatted": "₹399 (HD)",
        "image_url": "https://images.unsplash.com/photo-1518676590629-3dcbd9c5a5c9?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Drama / Thriller / Dark Comedy | Runtime: 132 min | IMDb: 8.5/10 | Palme d'Or & 4 Academy Awards",
        "description": "Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan in this genre-bending cinematic masterpiece."
    },
    {
        "parent_asin": "MOV_SPIDER_VERSE",
        "title": "Spider-Man: Across the Spider-Verse (2023 Animated Film - Directed by Joaquim Dos Santos, Kemp Powers)",
        "category": "Movies & Entertainment",
        "store": "Sony Pictures Animation",
        "average_rating": 8.7,
        "rating_number": 360000,
        "price": 499.0,
        "price_currency": "INR",
        "price_formatted": "₹499 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1635805737707-575885ab0820?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Animation / Action / Sci-Fi | Runtime: 140 min | IMDb: 8.7/10 | Visual Artistry Milestone",
        "description": "Miles Morales catapults across the Multiverse, where he encounters a team of Spider-People charged with protecting its very existence, forcing him to redefine what it means to be a hero."
    },
    {
        "parent_asin": "MOV_BLADE_RUNNER_2049",
        "title": "Blade Runner 2049 (2017 Film - Directed by Denis Villeneuve, Starring Ryan Gosling, Harrison Ford, Ana de Armas)",
        "category": "Movies & Entertainment",
        "store": "Warner Bros. Pictures",
        "average_rating": 8.0,
        "rating_number": 640000,
        "price": 499.0,
        "price_currency": "INR",
        "price_formatted": "₹499 (4K UHD)",
        "image_url": "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?auto=format&fit=crop&w=800&q=80",
        "specs": "Genre: Sci-Fi / Mystery / Thriller | Runtime: 164 min | IMDb: 8.0/10 | 2 Academy Awards (Cinematography)",
        "description": "Young Blade Runner K's discovery of a long-buried secret leads him to track down former Blade Runner Rick Deckard, who has been missing for thirty years in a hauntingly beautiful cyberpunk dystopia."
    },

    # ── 3. Photography & Creator Equipment (Community 16) ──
    {
        "parent_asin": "PHOTO_SONY_A6400",
        "title": "Sony Alpha ILCE-6400L 24.2MP Mirrorless Camera (with 16-50mm Power Zoom Lens, Real-Time Eye AF, 4K HDR Video, 180° Tiltable Touchscreen, Black)",
        "category": "Photography & Creator Gear",
        "store": "Sony",
        "average_rating": 4.7,
        "rating_number": 5120,
        "price": 74990.0,
        "price_currency": "INR",
        "price_formatted": "₹74,990",
        "image_url": "https://images.unsplash.com/photo-1516035069371-29a1b244cc32?auto=format&fit=crop&w=800&q=80",
        "specs": "24.2 MP APS-C Sensor | 0.02s Real-time AF | 4K HDR Video | 11 fps Burst | 403 grams",
        "description": "The gold standard compact mirrorless camera for creators and photography enthusiasts, featuring lightning-fast real-time eye tracking, crystal clear 4K video recording, and a versatile E-mount lens ecosystem."
    },
    {
        "parent_asin": "PHOTO_FUJI_XT30",
        "title": "Fujifilm X-T30 II Mirrorless Digital Camera Body (26.1MP X-Trans CMOS 4 Sensor, X-Processor 4, 18 Film Simulation Modes, 4K/30p Video, Classic Silver)",
        "category": "Photography & Creator Gear",
        "store": "Fujifilm",
        "average_rating": 4.8,
        "rating_number": 2340,
        "price": 79990.0,
        "price_currency": "INR",
        "price_formatted": "₹79,990",
        "image_url": "https://images.unsplash.com/photo-1502920917128-1aa500764cbd?auto=format&fit=crop&w=800&q=80",
        "specs": "26.1 MP X-Trans IV Sensor | 18 Film Simulation Modes | Dedicated Mechanical Dials | 378 grams",
        "description": "A dream gift for creative photographers who love tactile tactile physical controls and Fujifilm's legendary analog film simulation color profiles straight out of the camera."
    },
    {
        "parent_asin": "PHOTO_PEAK_DESIGN_20L",
        "title": "Peak Design Everyday Backpack 20L V2 (Weatherproof 400D Nylon, MagLatch Closure, Dedicated 15-inch Laptop Sleeve, FlexFold Dividers, Charcoal)",
        "category": "Photography & Creator Gear",
        "store": "Peak Design",
        "average_rating": 4.9,
        "rating_number": 3190,
        "price": 22990.0,
        "price_currency": "INR",
        "price_formatted": "₹22,990",
        "image_url": "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=800&q=80",
        "specs": "20L Capacity | MagLatch Hardware | 100% Recycled 400D Shell | Dual Side Access | Lifetime Warranty",
        "description": "Award-winning iconic camera and everyday gear bag designed with origami-inspired FlexFold internal dividers, dual weatherproof side zips, and premium commuter aesthetics."
    },
    {
        "parent_asin": "PHOTO_DJI_MINI4_PRO",
        "title": "DJI Mini 4 Pro Fly More Combo (Under 249g Lightweight Camera Drone, Omnidirectional Obstacle Sensing, 4K/60fps HDR True Vertical Shooting, 34-Min Flight)",
        "category": "Photography & Creator Gear",
        "store": "DJI",
        "average_rating": 4.8,
        "rating_number": 4870,
        "price": 69990.0,
        "price_currency": "INR",
        "price_formatted": "₹69,990",
        "image_url": "https://images.unsplash.com/photo-1527977966376-1c8408f9f108?auto=format&fit=crop&w=800&q=80",
        "specs": "Under 249 grams | 4K/60fps HDR | Omnidirectional Active Obstacle Avoidance | 20 km Video Transmission",
        "description": "Regulatory-friendly ultralight aerial drone delivering flagship imaging with true vertical shooting for social creators and 360-degree obstacle detection."
    },
    {
        "parent_asin": "PHOTO_JOBY_GORILLAPOD",
        "title": "JOBY GorillaPod 3K PRO Kit (Compact Precision Anodized Aluminum Flexible Tripod with BallHead 3K Pro for DSLR, Mirrorless & Creator Rigs)",
        "category": "Photography & Creator Gear",
        "store": "JOBY",
        "average_rating": 4.6,
        "rating_number": 7890,
        "price": 8990.0,
        "price_currency": "INR",
        "price_formatted": "₹8,990",
        "image_url": "https://images.unsplash.com/photo-1516724562728-afc824a36e84?auto=format&fit=crop&w=800&q=80",
        "specs": "Supports up to 3 kg | CNC Machined Aluminum Sockets | Arca-Swiss Compatible QR Plate | 463 grams",
        "description": "Wrap it, stand it, or grip it: the industry's favorite flexible creator tripod engineered from durable aluminum to secure mirrorless cameras on any terrain or railing."
    },
    {
        "parent_asin": "PHOTO_RODE_WIRELESS_PRO",
        "title": "RØDE Wireless PRO Dual-Channel Wireless Microphone System (32-Bit Float On-Board Recording, Timecode Generator, 260m Range, Charging Case Included)",
        "category": "Photography & Creator Gear",
        "store": "Rode",
        "average_rating": 4.8,
        "rating_number": 2150,
        "price": 32990.0,
        "price_currency": "INR",
        "price_formatted": "₹32,990",
        "image_url": "https://images.unsplash.com/photo-1590602847861-f357a9332bbc?auto=format&fit=crop&w=800&q=80",
        "specs": "Dual Transmitter + Receiver | 32-bit Float Internal Recording | 260m Transmission | Smart GainAssist",
        "description": "Studio-grade wireless audio system featuring 32-bit float recording that guarantees clipped audio is never lost, complete with lavalier mics and smart timecode synchronization."
    },

    # ── 4. Audio, Keyboards & Lifestyle Tech (Community 17) ──
    {
        "parent_asin": "TECH_SONY_XM5",
        "title": "Sony WH-1000XM5 Wireless Noise Cancelling Headphones (Auto NC Optimizer, 30hr Battery, Crystal Clear Hands-Free Calling, Multipoint Connection, Black)",
        "category": "Audio & Lifestyle Tech",
        "store": "Sony",
        "average_rating": 4.7,
        "rating_number": 18900,
        "price": 26990.0,
        "price_currency": "INR",
        "price_formatted": "₹26,990",
        "image_url": "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=800&q=80",
        "specs": "Industry-leading Active Noise Cancellation | 30h Battery | LDAC Hi-Res Audio | Multipoint Bluetooth",
        "description": "Benchmark premium wireless headphones featuring dual processor noise cancellation, ultra-comfortable soft fit leather, and stellar microphone isolation for programmers and travelers."
    },
    {
        "parent_asin": "TECH_AIRPODS_PRO2",
        "title": "Apple AirPods Pro (2nd Generation with MagSafe Case USB-C, Up to 2x More Active Noise Cancellation, Adaptive Audio, Personalized Spatial Audio)",
        "category": "Audio & Lifestyle Tech",
        "store": "Apple",
        "average_rating": 4.8,
        "rating_number": 43200,
        "price": 22900.0,
        "price_currency": "INR",
        "price_formatted": "₹22,900",
        "image_url": "https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=800&q=80",
        "specs": "H2 Headphone Chip | Adaptive Audio & Transparency Mode | Dust, Sweat & Water Resistant (IP54)",
        "description": "Unmatched in-ear noise cancellation and seamless iOS/Mac device switching, featuring Adaptive Audio that dynamically blends Transparency and Noise Cancellation depending on environment."
    },
    {
        "parent_asin": "TECH_MX_MASTER3S",
        "title": "Logitech MX Master 3S Wireless Performance Mouse (Quiet Clicks, 8000 DPI Any-Surface Tracking, MagSpeed Electromagnetic Scrolling, Bluetooth/Logi Bolt)",
        "category": "Audio & Lifestyle Tech",
        "store": "Logitech",
        "average_rating": 4.8,
        "rating_number": 32100,
        "price": 8495.0,
        "price_currency": "INR",
        "price_formatted": "₹8,495",
        "image_url": "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?auto=format&fit=crop&w=800&q=80",
        "specs": "8000 DPI Optical Sensor | MagSpeed 1,000 Lines/sec Scroll Wheel | Quiet Click Technology | 70-Day Battery",
        "description": "The definitive ergonomic productivity mouse used by programmers and designers worldwide, featuring hyper-fast MagSpeed scrolling and glass-surface precision tracking."
    },
    {
        "parent_asin": "TECH_KEYCHRON_K2PRO",
        "title": "Keychron K2 Pro QMK/VIA Wireless Custom Mechanical Keyboard (Compact 75% Layout, Hot-Swappable RGB Backlight, Pre-Lubed Keychron K Pro Red Switches)",
        "category": "Audio & Lifestyle Tech",
        "store": "Keychron",
        "average_rating": 4.7,
        "rating_number": 4650,
        "price": 9499.0,
        "price_currency": "INR",
        "price_formatted": "₹9,499",
        "image_url": "https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=800&q=80",
        "specs": "75% Layout | Bluetooth 5.1 & Type-C | QMK/VIA Programmable Keys | Double-Shot PBT Keycaps",
        "description": "Custom mechanical keyboard with hot-swappable switch sockets, sound-absorbing foam, and full Mac/Windows key remapping for a deeply satisfying typing experience."
    },
    {
        "parent_asin": "TECH_KINDLE_PW",
        "title": "Amazon Kindle Paperwhite 16GB (6.8-inch Glare-Free Display, Adjustable Warm Light, Up to 10 Weeks Battery Life, IPX8 Waterproof, Black)",
        "category": "Audio & Lifestyle Tech",
        "store": "Amazon",
        "average_rating": 4.7,
        "rating_number": 51200,
        "price": 14999.0,
        "price_currency": "INR",
        "price_formatted": "₹14,999",
        "image_url": "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80",
        "specs": "6.8\" 300 ppi Glare-Free E-Ink | Adjustable Warm Light | 10-Week Battery | IPX8 Waterproof | USB-C",
        "description": "Read comfortably day or night with a paper-like 300 ppi glare-free screen, waterproof durability for reading anywhere, and battery life measured in weeks instead of hours."
    }
]

# Merge into metadata dictionary
all_meta = dict(toys_meta)
for it in NEW_ITEMS:
    asin = it["parent_asin"]
    all_meta[asin] = it

# Assign new community IDs
# Community 14: Laptops & Computers
# Community 15: Movies & Entertainment
# Community 16: Photography & Creator Gear
# Community 17: Audio & Lifestyle Tech
cat_to_comm = {
    "Laptops & Computers": 14,
    "Movies & Entertainment": 15,
    "Photography & Creator Gear": 16,
    "Audio & Lifestyle Tech": 17
}

updated_comm_data = dict(comm_data)
for it in NEW_ITEMS:
    asin = it["parent_asin"]
    cat = it["category"]
    comm_id = cat_to_comm[cat]
    updated_comm_data[asin] = comm_id

# Save enriched metadata and communities
out_meta_path = os.path.join(base_dir, "recoza_catalog_metadata.json")
with open(out_meta_path, "w", encoding="utf-8") as f:
    json.dump(all_meta, f, indent=2)

out_comm_path = os.path.join(base_dir, "recoza_communities.json")
with open(out_comm_path, "w", encoding="utf-8") as f:
    json.dump(updated_comm_data, f, indent=2)

print(f"Successfully generated Recoza multi-domain catalog!")
print(f"Total catalog items: {len(all_meta)} (original 2,399 + {len(NEW_ITEMS)} new items)")
print(f"Categories: {set(x.get('category') for x in all_meta.values())}")
