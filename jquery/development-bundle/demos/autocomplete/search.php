<?php

$q = strtolower($_GET["term"]);
if (!$q) return;
$items = array(
"Great Bittern"=>"Botaurus stellaris",
"Little Grebe"=>"Tachybaptus ruficollis",
"Black-necked Grebe"=>"Podiceps nigricollis",
"Little Bittern"=>"Ixobrychus minutus",
"Black-crowned Night Heron"=>"Nycticorax nycticorax",
"Purple Heron"=>"Ardea purpurea",
"White Stork"=>"Ciconia ciconia",
"Spoonbill"=>"Platalea leucorodia",
"Red-crested Pochard"=>"Netta rufina",
"Common Eider"=>"Somateria mollissima",
"Red Kite"=>"Milvus milvus",
"Hen Harrier"=>"Circus cyaneus",
"Montagu`s Harrier"=>"Circus pygargus",
"Black Grouse"=>"Tetrao tetrix",
"Grey Partridge"=>"Perdix perdix",
"Spotted Crake"=>"Porzana porzana",
"Corncrake"=>"Crex crex",
"Common Crane"=>"Grus grus",
"Avocet"=>"Recurvirostra avosetta",
"Stone Curlew"=>"Burhinus oedicnemus",
"Common Ringed Plover"=>"Charadrius hiaticula",
"Kentish Plover"=>"Charadrius alexandrinus",
"Ruff"=>"Philomachus pugnax",
"Common Snipe"=>"Gallinago gallinago",
"Black-tailed Godwit"=>"Limosa limosa",
"Common Redshank"=>"Tringa totanus",
"Sandwich Tern"=>"Sterna sandvicensis",
"Common Tern"=>"Sterna hirundo",
"Arctic Tern"=>"Sterna paradisaea",
"Little Tern"=>"Sternula albifrons",
"Black Tern"=>"Chlidonias niger",
"Barn Owl"=>"Tyto alba",
"Little Owl"=>"Athene noctua",
"Short-eared Owl"=>"Asio flammeus",
"European Nightjar"=>"Caprimulgus europaeus",
"Common Kingfisher"=>"Alcedo atthis",
"Eurasian Hoopoe"=>"Upupa epops",
"Eurasian Wryneck"=>"Jynx torquilla",
"European Green Woodpecker"=>"Picus viridis",
"Crested Lark"=>"Galerida cristata",
"White-headed Duck"=>"Oxyura leucocephala",
"Pale-bellied Brent Goose"=>"Branta hrota",
"Tawny Pipit"=>"Anthus campestris",
"Whinchat"=>"Saxicola rubetra",
"European Stonechat"=>"Saxicola rubicola",
"Northern Wheatear"=>"Oenanthe oenanthe",
"Savi`s Warbler"=>"Locustella luscinioides",
"Sedge Warbler"=>"Acrocephalus schoenobaenus",
"Great Reed Warbler"=>"Acrocephalus arundinaceus",
"Bearded Reedling"=>"Panurus biarmicus",
"Red-backed Shrike"=>"Lanius collurio",
"Great Grey Shrike"=>"Lanius excubitor",
"Woodchat Shrike"=>"Lanius senator",
"Common Raven"=>"Corvus corax",
"Yellowhammer"=>"Emberiza citrinella",
"Ortolan Bunting"=>"Emberiza hortulana",
"Corn Bunting"=>"Emberiza calandra",
"Great Cormorant"=>"Phalacrocorax carbo",
"Hawfinch"=>"Coccothraustes coccothraustes",
"Common Shelduck"=>"Tadorna tadorna",
"Bluethroat"=>"Luscinia svecica",
"Grey Heron"=>"Ardea cinerea",
"Barn Swallow"=>"Hirundo rustica",
"Hooded Crow"=>"Corvus cornix",
"Dunlin"=>"Calidris alpina",
"Eurasian Pied Flycatcher"=>"Ficedula hypoleuca",
"Eurasian Nuthatch"=>"Sitta europaea",
"Short-toed Tree Creeper"=>"Certhia brachydactyla",
"Wood Lark"=>"Lullula arborea",
"Tree Pipit"=>"Anthus trivialis",
"Eurasian Hobby"=>"Falco subbuteo",
"Marsh Warbler"=>"Acrocephalus palustris",
"Wood Sandpiper"=>"Tringa glareola",
"Tawny Owl"=>"Strix aluco",
"Lesser Whitethroat"=>"Sylvia curruca",
"Barnacle Goose"=>"Branta leucopsis",
"Common Goldeneye"=>"Bucephala clangula",
"Western Marsh Harrier"=>"Circus aeruginosus",
"Common Buzzard"=>"Buteo buteo",
"Sanderling"=>"Calidris alba",
"Little Gull"=>"Larus minutus",
"Eurasian Magpie"=>"Pica pica",
"Willow Warbler"=>"Phylloscopus trochilus",
"Wood Warbler"=>"Phylloscopus sibilatrix",
"Great Crested Grebe"=>"Podiceps cristatus",
"Eurasian Jay"=>"Garrulus glandarius",
"Common Redstart"=>"Phoenicurus phoenicurus",
"Blue-headed Wagtail"=>"Motacilla flava",
"Common Swift"=>"Apus apus",
"Marsh Tit"=>"Poecile palustris",
"Goldcrest"=>"Regulus regulus",
"European Golden Plover"=>"Pluvialis apricaria",
"Eurasian Bullfinch"=>"Pyrrhula pyrrhula",
"Common Whitethroat"=>"Sylvia communis",
"Meadow Pipit"=>"Anthus pratensis",
"Greylag Goose"=>"Anser anser",
"Spotted Flycatcher"=>"Muscicapa striata",
"European Greenfinch"=>"Carduelis chloris",
"Common Greenshank"=>"Tringa nebularia",
"Great Spotted Woodpecker"=>"Dendrocopos major",
"Greater Canada Goose"=>"Branta canadensis",
"Mistle Thrush"=>"Turdus viscivorus",
"Great Black-backed Gull"=>"Larus marinus",
"Goosander"=>"Mergus merganser",
"Great Egret"=>"Casmerodius albus",
"Northern Goshawk"=>"Accipiter gentilis",
"Dunnock"=>"Prunella modularis",
"Stock Dove"=>"Columba oenas",
"Common Wood Pigeon"=>"Columba palumbus",
"Eurasian Woodcock"=>"Scolopax rusticola",
"House Sparrow"=>"Passer domesticus",
"Common House Martin"=>"Delichon urbicum",
"Red Knot"=>"Calidris canutus",
"Western Jackdaw"=>"Corvus monedula",
"Brambling"=>"Fringilla montifringilla",
"Northern Lapwing"=>"Vanellus vanellus",
"European Reed Warbler"=>"Acrocephalus scirpaceus",
"Lesser Black-backed Gull"=>"Larus fuscus",
"Little Egret"=>"Egretta garzetta",
"Little Stint"=>"Calidris minuta",
"Common Linnet"=>"Carduelis cannabina",
"Mute Swan"=>"Cygnus olor",
"Common Cuckoo"=>"Cuculus canorus",
"Black-headed Gull"=>"Larus ridibundus",
"Greater White-fronted Goose"=>"Anser albifrons",
"Great Tit"=>"Parus major",
"Redwing"=>"Turdus iliacus",
"Gadwall"=>"Anas strepera",
"Fieldfare"=>"Turdus pilaris",
"Tufted Duck"=>"Aythya fuligula",
"Crested Tit"=>"Lophophanes cristatus",
"Willow Tit"=>"Poecile montanus",
"Eurasian Coot"=>"Fulica atra",
"Common Blackbird"=>"Turdus merula",
"Smew"=>"Mergus albellus",
"Common Sandpiper"=>"Actitis hypoleucos",
"Sand Martin"=>"Riparia riparia",
"Purple Sandpiper"=>"Calidris maritima",
"Northern Pintail"=>"Anas acuta",
"Blue Tit"=>"Cyanistes caeruleus",
"European Goldfinch"=>"Carduelis carduelis",
"Eurasian Whimbrel"=>"Numenius phaeopus",
"Common Reed Bunting"=>"Emberiza schoeniclus",
"Eurasian Tree Sparrow"=>"Passer montanus",
"Rook"=>"Corvus frugilegus",
"European Robin"=>"Erithacus rubecula",
"Bar-tailed Godwit"=>"Limosa lapponica",
"Dark-bellied Brent Goose"=>"Branta bernicla",
"Eurasian Oystercatcher"=>"Haematopus ostralegus",
"Eurasian Siskin"=>"Carduelis spinus",
"Northern Shoveler"=>"Anas clypeata",
"Eurasian Wigeon"=>"Anas penelope",
"Eurasian Sparrow Hawk"=>"Accipiter nisus",
"Icterine Warbler"=>"Hippolais icterina",
"Common Starling"=>"Sturnus vulgaris",
"Long-tailed Tit"=>"Aegithalos caudatus",
"Ruddy Turnstone"=>"Arenaria interpres",
"Mew Gull"=>"Larus canus",
"Common Pochard"=>"Aythya ferina",
"Common Chiffchaff"=>"Phylloscopus collybita",
"Greater Scaup"=>"Aythya marila",
"Common Kestrel"=>"Falco tinnunculus",
"Garden Warbler"=>"Sylvia borin",
"Eurasian Collared Dove"=>"Streptopelia decaocto",
"Eurasian Skylark"=>"Alauda arvensis",
"Common Chaffinch"=>"Fringilla coelebs",
"Common Moorhen"=>"Gallinula chloropus",
"Water Pipit"=>"Anthus spinoletta",
"Mallard"=>"Anas platyrhynchos",
"Winter Wren"=>"Troglodytes troglodytes",
"Common Teal"=>"Anas crecca",
"Green Sandpiper"=>"Tringa ochropus",
"White Wagtail"=>"Motacilla alba",
"Eurasian Curlew"=>"Numenius arquata",
"Song Thrush"=>"Turdus philomelos",
"European Herring Gull"=>"Larus argentatus",
"Grey Plover"=>"Pluvialis squatarola",
"Carrion Crow"=>"Corvus corone",
"Coal Tit"=>"Periparus ater",
"Spotted Redshank"=>"Tringa erythropus",
"Blackcap"=>"Sylvia atricapilla",
"Egyptian Vulture"=>"Neophron percnopterus",
"Razorbill"=>"Alca torda",
"Alpine Swift"=>"Apus melba",
"Long-legged Buzzard"=>"Buteo rufinus",
"Audouin`s Gull"=>"Larus audouinii",
"Balearic Shearwater"=>"Puffinus mauretanicus",
"Upland Sandpiper"=>"Bartramia longicauda",
"Greater Spotted Eagle"=>"Aquila clanga",
"Ring Ouzel"=>"Turdus torquatus",
"Yellow-browed Warbler"=>"Phylloscopus inornatus",
"Blue Rock Thrush"=>"Monticola solitarius",
"Buff-breasted Sandpiper"=>"Tryngites subruficollis",
"Jack Snipe"=>"Lymnocryptes minimus",
"White-rumped Sandpiper"=>"Calidris fuscicollis",
"Ruddy Shelduck"=>"Tadorna ferruginea",
"Cetti's Warbler"=>"Cettia cetti",
"Citrine Wagtail"=>"Motacilla citreola",
"Roseate Tern"=>"Sterna dougallii",
"Black-legged Kittiwake"=>"Rissa tridactyla",
"Pygmy Cormorant"=>"Phalacrocorax pygmeus",
"Booted Eagle"=>"Aquila pennata",
"Lesser White-fronted Goose"=>"Anser erythropus",
"Little Bunting"=>"Emberiza pusilla",
"Eleonora's Falcon"=>"Falco eleonorae",
"European Serin"=>"Serinus serinus",
"Twite"=>"Carduelis flavirostris",
"Yellow-legged Gull"=>"Larus michahellis",
"Gyr Falcon"=>"Falco rusticolus",
"Greenish Warbler"=>"Phylloscopus trochiloides",
"Red-necked Phalarope"=>"Phalaropus lobatus",
"Mealy Redpoll"=>"Carduelis flammea",
"Glaucous Gull"=>"Larus hyperboreus",
"Great Skua"=>"Stercorarius skua",
"Great Bustard"=>"Otis tarda",
"Velvet Scoter"=>"Melanitta fusca",
"Pine Grosbeak"=>"Pinicola enucleator",
"House Crow"=>"Corvus splendens",
"Hume`s Leaf Warbler"=>"Phylloscopus humei",
"Great Northern Loon"=>"Gavia immer",
"Long-tailed Duck"=>"Clangula hyemalis",
"Lapland Longspur"=>"Calcarius lapponicus",
"Northern Gannet"=>"Morus bassanus",
"Eastern Imperial Eagle"=>"Aquila heliaca",
"Little Auk"=>"Alle alle",
"Lesser Spotted Woodpecker"=>"Dendrocopos minor",
"Iceland Gull"=>"Larus glaucoides",
"Parasitic Jaeger"=>"Stercorarius parasiticus",
"Bewick`s Swan"=>"Cygnus bewickii",
"Little Bustard"=>"Tetrax tetrax",
"Little Crake"=>"Porzana parva",
"Baillon`s Crake"=>"Porzana pusilla",
"Long-tailed Jaeger"=>"Stercorarius longicaudus",
"King Eider"=>"Somateria spectabilis",
"Greater Short-toed Lark"=>"Calandrella brachydactyla",
"Houbara Bustard"=>"Chlamydotis undulata",
"Curlew Sandpiper"=>"Calidris ferruginea",
"Common Crossbill"=>"Loxia curvirostra",
"European Shag"=>"Phalacrocorax aristotelis",
"Horned Grebe"=>"Podiceps auritus",
"Common Quail"=>"Coturnix coturnix",
"Bearded Vulture"=>"Gypaetus barbatus",
"Lanner Falcon"=>"Falco biarmicus",
"Middle Spotted Woodpecker"=>"Dendrocopos medius",
"Pomarine Jaeger"=>"Stercorarius pomarinus",
"Red-breasted Merganser"=>"Mergus serrator",
"Eurasian Black Vulture"=>"Aegypius monachus",
"Eurasian Dotterel"=>"Charadrius morinellus",
"Common Nightingale"=>"Luscinia megarhynchos",
"Northern willow warbler"=>"Phylloscopus trochilus acredula",
"Manx Shearwater"=>"Puffinus puffinus",
"Northern Fulmar"=>"Fulmarus glacialis",
"Eurasian Eagle Owl"=>"Bubo bubo",
"Orphean Warbler"=>"Sylvia hortensis",
"Melodious Warbler"=>"Hippolais polyglotta",
"Pallas's Leaf Warbler"=>"Phylloscopus proregulus",
"Atlantic Puffin"=>"Fratercula arctica",
"Black-throated Loon"=>"Gavia arctica",
"Bohemian Waxwing"=>"Bombycilla garrulus",
"Marsh Sandpiper"=>"Tringa stagnatilis",
"Great Snipe"=>"Gallinago media",
"Squacco Heron"=>"Ardeola ralloides",
"Long-eared Owl"=>"Asio otus",
"Caspian Tern"=>"Hydroprogne caspia",
"Red-breasted Goose"=>"Branta ruficollis",
"Red-throated Loon"=>"Gavia stellata",
"Common Rosefinch"=>"Carpodacus erythrinus",
"Red-footed Falcon"=>"Falco vespertinus",
"Ross's Goose"=>"Anser rossii",
"Red Phalarope"=>"Phalaropus fulicarius",
"Pied Wagtail"=>"Motacilla yarrellii",
"Rose-coloured Starling"=>"Sturnus roseus",
"Rough-legged Buzzard"=>"Buteo lagopus",
"Saker Falcon"=>"Falco cherrug",
"European Roller"=>"Coracias garrulus",
"Short-toed Eagle"=>"Circaetus gallicus",
"Peregrine Falcon"=>"Falco peregrinus",
"Merlin"=>"Falco columbarius",
"Snow Goose"=>"Anser caerulescens",
"Snowy Owl"=>"Bubo scandiacus",
"Snow Bunting"=>"Plectrophenax nivalis",
"Common Grasshopper Warbler"=>"Locustella naevia",
"Golden Eagle"=>"Aquila chrysaetos",
"Black-winged Stilt"=>"Himantopus himantopus",
"Steppe Eagle"=>"Aquila nipalensis",
"Pallid Harrier"=>"Circus macrourus",
"European Storm-petrel"=>"Hydrobates pelagicus",
"Horned Lark"=>"Eremophila alpestris",
"Eurasian Treecreeper"=>"Certhia familiaris",
"Taiga Bean Goose"=>"Anser fabalis",
"Temminck`s Stint"=>"Calidris temminckii",
"Terek Sandpiper"=>"Xenus cinereus",
"Tundra Bean Goose"=>"Anser serrirostris",
"European Turtle Dove"=>"Streptopelia turtur",
"Leach`s Storm-petrel"=>"Oceanodroma leucorhoa",
"Eurasian Griffon Vulture"=>"Gyps fulvus",
"Paddyfield Warbler"=>"Acrocephalus agricola",
"Osprey"=>"Pandion haliaetus",
"Firecrest"=>"Regulus ignicapilla",
"Water Rail"=>"Rallus aquaticus",
"European Honey Buzzard"=>"Pernis apivorus",
"Eurasian Golden Oriole"=>"Oriolus oriolus",
"Whooper Swan"=>"Cygnus cygnus",
"Two-barred Crossbill"=>"Loxia leucoptera",
"White-tailed Eagle"=>"Haliaeetus albicilla",
"Atlantic Murre"=>"Uria aalge",
"Garganey"=>"Anas querquedula",
"Black Redstart"=>"Phoenicurus ochruros",
"Common Scoter"=>"Melanitta nigra",
"Rock Pipit"=>"Anthus petrosus",
"Lesser Spotted Eagle"=>"Aquila pomarina",
"Cattle Egret"=>"Bubulcus ibis",
"White-winged Black Tern"=>"Chlidonias leucopterus",
"Black Stork"=>"Ciconia nigra",
"Mediterranean Gull"=>"Larus melanocephalus",
"Black Kite"=>"Milvus migrans",
"Yellow Wagtail"=>"Motacilla flavissima",
"Red-necked Grebe"=>"Podiceps grisegena",
"Gull-billed Tern"=>"Gelochelidon nilotica",
"Pectoral Sandpiper"=>"Calidris melanotos",
"Barred Warbler"=>"Sylvia nisoria",
"Red-throated Pipit"=>"Anthus cervinus",
"Grey Wagtail"=>"Motacilla cinerea",
"Richard`s Pipit"=>"Anthus richardi",
"Black Woodpecker"=>"Dryocopus martius",
"Little Ringed Plover"=>"Charadrius dubius",
"Whiskered Tern"=>"Chlidonias hybrida",
"Lesser Redpoll"=>"Carduelis cabaret",
"Pallas' Bunting"=>"Emberiza pallasi",
"Ferruginous Duck"=>"Aythya nyroca",
"Whistling Swan"=>"Cygnus columbianus",
"Black Brant"=>"Branta nigricans",
"Marbled Teal"=>"Marmaronetta angustirostris",
"Canvasback"=>"Aythya valisineria",
"Redhead"=>"Aythya americana",
"Lesser Scaup"=>"Aythya affinis",
"Steller`s Eider"=>"Polysticta stelleri",
"Spectacled Eider"=>"Somateria fischeri",
"Harlequin Duck"=>"Histronicus histrionicus",
"Black Scoter"=>"Melanitta americana",
"Surf Scoter"=>"Melanitta perspicillata",
"Barrow`s Goldeneye"=>"Bucephala islandica",
"Falcated Duck"=>"Anas falcata",
"American Wigeon"=>"Anas americana",
"Blue-winged Teal"=>"Anas discors",
"American Black Duck"=>"Anas rubripes",
"Baikal Teal"=>"Anas formosa",
"Green-Winged Teal"=>"Anas carolinensis",
"Hazel Grouse"=>"Bonasa bonasia",
"Rock Partridge"=>"Alectoris graeca",
"Red-legged Partridge"=>"Alectoris rufa",
"Yellow-billed Loon"=>"Gavia adamsii",
"Cory`s Shearwater"=>"Calonectris borealis",
"Madeiran Storm-Petrel"=>"Oceanodroma castro",
"Great White Pelican"=>"Pelecanus onocrotalus",
"Dalmatian Pelican"=>"Pelecanus crispus",
"American Bittern"=>"Botaurus lentiginosus",
"Glossy Ibis"=>"Plegadis falcinellus",
"Spanish Imperial Eagle"=>"Aquila adalberti",
"Lesser Kestrel"=>"Falco naumanni",
"Houbara Bustard"=>"Chlamydotis undulata",
"Crab-Plover"=>"Dromas ardeola",
"Cream-coloured Courser"=>"Cursorius cursor",
"Collared Pratincole"=>"Glareola pratincola",
"Black-winged Pratincole"=>"Glareola nordmanni",
"Killdeer"=>"Charadrius vociferus",
"Lesser Sand Plover"=>"Charadrius mongolus",
"Greater Sand Plover"=>"Charadrius leschenaultii",
"Caspian Plover"=>"Charadrius asiaticus",
"American Golden Plover"=>"Pluvialis dominica",
"Pacific Golden Plover"=>"Pluvialis fulva",
"Sharp-tailed Sandpiper"=>"Calidris acuminata",
"Broad-billed Sandpiper"=>"Limicola falcinellus",
"Spoon-Billed Sandpiper"=>"Eurynorhynchus pygmaeus",
"Short-Billed Dowitcher"=>"Limnodromus griseus",
"Long-billed Dowitcher"=>"Limnodromus scolopaceus",
"Hudsonian Godwit"=>"Limosa haemastica",
"Little Curlew"=>"Numenius minutus",
"Lesser Yellowlegs"=>"Tringa flavipes",
"Wilson`s Phalarope"=>"Phalaropus tricolor",
"Pallas`s Gull"=>"Larus ichthyaetus",
"Laughing Gull"=>"Larus atricilla",
"Franklin`s Gull"=>"Larus pipixcan",
"Bonaparte`s Gull"=>"Larus philadelphia",
"Ring-billed Gull"=>"Larus delawarensis",
"American Herring Gull"=>"Larus smithsonianus",
"Caspian Gull"=>"Larus cachinnans",
"Ivory Gull"=>"Pagophila eburnea",
"Royal Tern"=>"Sterna maxima",
"Brünnich`s Murre"=>"Uria lomvia",
"Crested Auklet"=>"Aethia cristatella",
"Parakeet Auklet"=>"Cyclorrhynchus psittacula",
"Tufted Puffin"=>"Lunda cirrhata",
"Laughing Dove"=>"Streptopelia senegalensis",
"Great Spotted Cuckoo"=>"Clamator glandarius",
"Great Grey Owl"=>"Strix nebulosa",
"Tengmalm`s Owl"=>"Aegolius funereus",
"Red-Necked Nightjar"=>"Caprimulgus ruficollis",
"Chimney Swift"=>"Chaetura pelagica",
"Green Bea-Eater"=>"Merops orientalis",
"Grey-headed Woodpecker"=>"Picus canus",
"Lesser Short-Toed Lark"=>"Calandrella rufescens",
"Eurasian Crag Martin"=>"Hirundo rupestris",
"Red-rumped Swallow"=>"Cecropis daurica",
"Blyth`s Pipit"=>"Anthus godlewskii",
"Pechora Pipit"=>"Anthus gustavi",
"Grey-headed Wagtail"=>"Motacilla thunbergi",
"Yellow-Headed Wagtail"=>"Motacilla lutea",
"White-throated Dipper"=>"Cinclus cinclus",
"Rufous-Tailed Scrub Robin"=>"Cercotrichas galactotes",
"Thrush Nightingale"=>"Luscinia luscinia",
"White-throated Robin"=>"Irania gutturalis",
"Caspian Stonechat"=>"Saxicola maura variegata",
"Western Black-eared Wheatear"=>"Oenanthe hispanica",
"Rufous-tailed Rock Thrush"=>"Monticola saxatilis",
"Red-throated Thrush/Black-throated"=>"Turdus ruficollis",
"American Robin"=>"Turdus migratorius",
"Zitting Cisticola"=>"Cisticola juncidis",
"Lanceolated Warbler"=>"Locustella lanceolata",
"River Warbler"=>"Locustella fluviatilis",
"Blyth`s Reed Warbler"=>"Acrocephalus dumetorum",
"Caspian Reed Warbler"=>"Acrocephalus fuscus",
"Aquatic Warbler"=>"Acrocephalus paludicola",
"Booted Warbler"=>"Acrocephalus caligatus",
"Marmora's Warbler"=>"Sylvia sarda",
"Dartford Warbler"=>"Sylvia undata",
"Subalpine Warbler"=>"Sylvia cantillans",
"Ménétries's Warbler"=>"Sylvia mystacea",
"Rüppel's Warbler"=>"Sylvia rueppelli",
"Asian Desert Warbler"=>"Sylvia nana",
"Western Orphean Warbler"=>"Sylvia hortensis hortensis",
"Arctic Warbler"=>"Phylloscopus borealis",
"Radde`s Warbler"=>"Phylloscopus schwarzi",
"Western Bonelli`s Warbler"=>"Phylloscopus bonelli",
"Red-breasted Flycatcher"=>"Ficedula parva",
"Eurasian Penduline Tit"=>"Remiz pendulinus",
"Daurian Shrike"=>"Lanius isabellinus",
"Long-Tailed Shrike"=>"Lanius schach",
"Lesser Grey Shrike"=>"Lanius minor",
"Southern Grey Shrike"=>"Lanius meridionalis",
"Masked Shrike"=>"Lanius nubicus",
"Spotted Nutcracker"=>"Nucifraga caryocatactes",
"Daurian Jackdaw"=>"Corvus dauuricus",
"Purple-Backed Starling"=>"Sturnus sturninus",
"Red-Fronted Serin"=>"Serinus pusillus",
"Arctic Redpoll"=>"Carduelis hornemanni",
"Scottish Crossbill"=>"Loxia scotica",
"Parrot Crossbill"=>"Loxia pytyopsittacus",
"Black-faced Bunting"=>"Emberiza spodocephala",
"Pink-footed Goose"=>"Anser brachyrhynchus",
"Black-winged Kite"=>"Elanus caeruleus",
"European Bee-eater"=>"Merops apiaster",
"Sabine`s Gull"=>"Larus sabini",
"Sooty Shearwater"=>"Puffinus griseus",
"Lesser Canada Goose"=>"Branta hutchinsii",
"Ring-necked Duck"=>"Aythya collaris",
"Greater Flamingo"=>"Phoenicopterus roseus",
"Iberian Chiffchaff"=>"Phylloscopus ibericus",
"Ashy-headed Wagtail"=>"Motacilla cinereocapilla",
"Stilt Sandpiper"=>"Calidris himantopus",
"Siberian Stonechat"=>"Saxicola maurus",
"Greater Yellowlegs"=>"Tringa melanoleuca",
"Forster`s Tern"=>"Sterna forsteri",
"Dusky Warbler"=>"Phylloscopus fuscatus",
"Cirl Bunting"=>"Emberiza cirlus",
"Olive-backed Pipit"=>"Anthus hodgsoni",
"Sociable Lapwing"=>"Vanellus gregarius",
"Spotted Sandpiper"=>"Actitis macularius",
"Baird`s Sandpiper"=>"Calidris bairdii",
"Rustic Bunting"=>"Emberiza rustica",
"Yellow-browed Bunting"=>"Emberiza chrysophrys",
"Great Shearwater"=>"Puffinus gravis",
"Bonelli`s Eagle"=>"Aquila fasciata",
"Calandra Lark"=>"Melanocorypha calandra",
"Sardinian Warbler"=>"Sylvia melanocephala",
"Ross's Gull"=>"Larus roseus",
"Yellow-Breasted Bunting"=>"Emberiza aureola",
"Pine Bunting"=>"Emberiza leucocephalos",
"Black Guillemot"=>"Cepphus grylle",
"Pied-billed Grebe"=>"Podilymbus podiceps",
"Soft-plumaged Petrel"=>"Pterodroma mollis",
"Bulwer's Petrel"=>"Bulweria bulwerii",
"White-Faced Storm-Petrel"=>"Pelagodroma marina",
"Pallas’s Fish Eagle"=>"Haliaeetus leucoryphus",
"Sandhill Crane"=>"Grus canadensis",
"Macqueen’s Bustard"=>"Chlamydotis macqueenii",
"White-tailed Lapwing"=>"Vanellus leucurus",
"Great Knot"=>"Calidris tenuirostris",
"Semipalmated Sandpiper"=>"Calidris pusilla",
"Red-necked Stint"=>"Calidris ruficollis",
"Slender-billed Curlew"=>"Numenius tenuirostris",
"Bridled Tern"=>"Onychoprion anaethetus",
"Pallas’s Sandgrouse"=>"Syrrhaptes paradoxus",
"European Scops Owl"=>"Otus scops",
"Northern Hawk Owl"=>"Surnia ulula",
"White-Throated Needletail"=>"Hirundapus caudacutus",
"Belted Kingfisher"=>"Ceryle alcyon",
"Blue-cheeked Bee-eater"=>"Merops persicus",
"Black-headed Wagtail"=>"Motacilla feldegg",
"Northern Mockingbird"=>"Mimus polyglottos",
"Alpine Accentor"=>"Prunella collaris",
"Red-flanked Bluetail"=>"Tarsiger cyanurus",
"Isabelline Wheatear"=>"Oenanthe isabellina",
"Pied Wheatear"=>"Oenanthe pleschanka",
"Eastern Black-eared Wheatear"=>"Oenanthe melanoleuca",
"Desert Wheatear"=>"Oenanthe deserti",
"White`s Thrush"=>"Zoothera aurea",
"Siberian Thrush"=>"Zoothera sibirica",
"Eyebrowed Thrush"=>"Turdus obscurus",
"Dusky Thrush"=>"Turdus eunomus",
"Black-throated Thrush"=>"Turdus atrogularis",
"Pallas`s Grasshopper Warbler"=>"Locustella certhiola",
"Spectacled Warbler"=>"Sylvia conspicillata",
"Two-barred Warbler"=>"Phylloscopus plumbeitarsus",
"Eastern Bonelli’s Warbler"=>"Phylloscopus orientalis",
"Collared Flycatcher"=>"Ficedula albicollis",
"Wallcreeper"=>"Tichodroma muraria",
"Turkestan Shrike"=>"Lanius phoenicuroides",
"Steppe Grey Shrike"=>"Lanius pallidirostris",
"Spanish Sparrow"=>"Passer hispaniolensis",
"Red-eyed Vireo"=>"Vireo olivaceus",
"Myrtle Warbler"=>"Dendroica coronata",
"White-crowned Sparrow"=>"Zonotrichia leucophrys",
"White-throated Sparrow"=>"Zonotrichia albicollis",
"Cretzschmar`s Bunting"=>"Emberiza caesia",
"Chestnut Bunting"=>"Emberiza rutila",
"Red-headed Bunting"=>"Emberiza bruniceps",
"Black-headed Bunting"=>"Emberiza melanocephala",
"Indigo Bunting"=>"Passerina cyanea",
"Balearic Woodchat Shrike"=>"Lanius senator badius",
"Demoiselle Crane"=>"Grus virgo",
"Chough"=>"Pyrrhocorax pyrrhocorax",
"Red-Billed Chough"=>"Pyrrhocorax graculus",
"Elegant Tern"=>"Sterna elegans",
"Chukar"=>"Alectoris chukar",
"Yellow-Billed Cuckoo"=>"Coccyzus americanus",
"American Sandwich Tern"=>"Sterna sandvicensis acuflavida",
"Olive-Tree Warbler"=>"Hippolais olivetorum",
"Eastern Olivaceous Warbler"=>"Acrocephalus pallidus",
"Indian Cormorant"=>"Phalacrocorax fuscicollis",
"Spur-Winged Lapwing"=>"Vanellus spinosus",
"Yelkouan Shearwater"=>"Puffinus yelkouan",
"Trumpeter Finch"=>"Bucanetes githagineus",
"Red Grouse"=>"Lagopus scoticus",
"Rock Ptarmigan"=>"Lagopus mutus",
"Long-Tailed Cormorant"=>"Phalacrocorax africanus",
"Double-crested Cormorant"=>"Phalacrocorax auritus",
"Magnificent Frigatebird"=>"Fregata magnificens",
"Naumann's Thrush"=>"Turdus naumanni",
"Oriental Pratincole"=>"Glareola maldivarum",
"Bufflehead"=>"Bucephala albeola",
"Snowfinch"=>"Montifrigilla nivalis",
"Ural owl"=>"Strix uralensis",
"Spanish Wagtail"=>"Motacilla iberiae",
"Song Sparrow"=>"Melospiza melodia",
"Rock Bunting"=>"Emberiza cia",
"Siberian Rubythroat"=>"Luscinia calliope",
"Pallid Swift"=>"Apus pallidus",
"Eurasian Pygmy Owl"=>"Glaucidium passerinum",
"Madeira Little Shearwater"=>"Puffinus baroli",
"House Finch"=>"Carpodacus mexicanus",
"Green Heron"=>"Butorides virescens",
"Solitary Sandpiper"=>"Tringa solitaria",
"Heuglin's Gull"=>"Larus heuglini"
);

function array_to_json( $array ){

    if( !is_array( $array ) ){
        return false;
    }

    $associative = count( array_diff( array_keys($array), array_keys( array_keys( $array )) ));
    if( $associative ){

        $construct = array();
        foreach( $array as $key => $value ){

            // We first copy each key/value pair into a staging array,
            // formatting each key and value properly as we go.

            // Format the key:
            if( is_numeric($key) ){
                $key = "key_$key";
            }
            $key = "\"".addslashes($key)."\"";

            // Format the value:
            if( is_array( $value )){
                $value = array_to_json( $value );
            } else if( !is_numeric( $value ) || is_string( $value ) ){
                $value = "\"".addslashes($value)."\"";
            }

            // Add to staging array:
            $construct[] = "$key: $value";
        }

        // Then we collapse the staging array into the JSON form:
        $result = "{ " . implode( ", ", $construct ) . " }";

    } else { // If the array is a vector (not associative):

        $construct = array();
        foreach( $array as $value ){

            // Format the value:
            if( is_array( $value )){
                $value = array_to_json( $value );
            } else if( !is_numeric( $value ) || is_string( $value ) ){
                $value = "'".addslashes($value)."'";
            }

            // Add to staging array:
            $construct[] = $value;
        }

        // Then we collapse the staging array into the JSON form:
        $result = "[ " . implode( ", ", $construct ) . " ]";
    }

    return $result;
}

$result = array();
foreach ($items as $key=>$value) {
	if (strpos(strtolower($key), $q) !== false) {
		array_push($result, array("id"=>$value, "label"=>$key, "value" => strip_tags($key)));
	}
	if (count($result) > 11)
		break;
}
echo array_to_json($result);

?>                                                     ��-    >J���-�Yc9|�b�@�l�* R�QaJI�ϼ�ӭ�0/�Y�|����/t%c(@z9ϯ����)^$�ߖPs�!C5������a�D`Ziu�yU��K,��~k>po�1�x�����H�?���������5��A~#�#����4i�vS��B*z)q��v��u�����/ưak�d,��JE��Qa�f�T�г�$T�IA��)�R=l�
�neb�1�|}��m���MZw��t!o�J��4 �+^�KX���^��$>ĚVУ�!7s] ��z�Wd��~=/��~0p��SN�����/@���P��P���r҃Pt���a��Ђ����`;���Xֱz�l�Fp0��)�4��DH�S�݀�<��G������"e�����݋q��u��j���۳_�q���)?����hV�I��a:$ %�7�k�Ag�VQP�/�x(д�͆a6�A�=�k���뛷��F�1�"¯��)�P
`}z�4!���H~�t ��-    \J���-e[c9��b�Z�l0* �SSa�kI�m���7��0q�<[��K�)���@|pT��x�G��s��P5�6�{q���6ws�/`�k8�����QNv4`3p�̖���P�e���~'U���t�NӑS�TX����4~�v�s �l�j��w��'[q�e��L\ΰ��v�aI:2����Lj��)Q:%�^1`�um.U�A�i��L?���4�NgT1A~����/<�N�!M͆�l�� ��y�a��pz$��J�,4k��{"�.j 55�.[W�N�\S0���K[���p����w@���"_�6*�LpbKP6ypO���.��w"`���B���J���pr.��ʡ���Y"�������"��V�����fs����A�`%E�%�%֣q�q4#7,�w�;h'=a�u++_��m �쟄�Qn模����v���k]A��r�����m��)(1p��7SY�H�sPڝ!�@3�I! ��-    zJ���-']c9��bJu�lv* V�Ta:�I����]�0�J�\g���`���*@~���/q�e��Z'u{P�5L"����})wR�c`^n��M���w�)�T(p� �"@q�C�|��j���|���q�P�o�����n��Ձ���cK@�F �@�7�q#|k�B
�>D�>�a'������N��	sCQ�e�U��7�7VV8GAEOG�FAd��-8l"'1߫�*f�x��ۘ�!+�P�I ��m�lw
�Tp���
�����٠�%a� �l�R��^�;�0�nCh�k�NBz#��@��)�@4��TGt�m�P�-�
�{����2�GnG`?g���'b�������p��R��a��,�8_|�����&v���,��߈��(�"	�1f�`q����o����qҥ�.?��T�+���a���61�h�o!���; Q��!� ���8c�v�xAT�ؒ#&��4��i�1��#���Ԇbj&!z��+<� ��-    �J���-�^c90�b���l�* �jVa�>J�B�K�0���]�a�]�J��I�@��^D��bу	�AKd*P��a���
��\�-�C`�p�n�R�%�(ݟIp55a���ߡ!�/�����ol��3��{�چ�{�i=;_vMʁ/�x$Y�����hG�q���<�(F�U��{a����P�#)�\Q��7͹�o��zAW�Q�A�4��@C����!q%�1}CD�1G5�U���hoc!	Q�z{� ���>/�c9f�M�jW�f��K7�Xj 9ԩu�H�Xo�$�06�C;u���,���%@��X�b	o�rd6�j��P��/ƶ��H��oel`�E�y:(�TN��qp�N�发��p���d���fx�Y0ڑ� �;A��,ґ�����P����)z�,6�qp(�0��&��^N��!aԊAB7K�q"�B�TQ���t`���EP���A�?�R0�q���*�1��uG�����`�_p!X�X��dy ��-    �J���-�`c9l�b��l"* Z�Wa*�J�Go'��з07�O_ϫ��;Ψ�]�-@��u��TѡB](oS�P{�v.%&�9���#�`bs�G!�	���U>pwi�)�i���-��"�����b�
Td��m���C�+m�O񸾁�e(<OC�J�]2W�q_A�9���ԒJ�% a�t�U
u�R�<�vQٻ�Dg��лKX�jEAe�:E\���
v(�1�ۃ��������E!�;� �] ��}��%\v�'�,�e �p����O �;dJ�?q���{<�0x3��G�
xo.KP@�����#ѐ��>h�P|�����w�H�i�\�`C$4P/M��	�*p8���z��Nj�j0'��07��굑�;��ߐ��� �Z�ҙ�bԠ�O=p�q�13?>����p�P�a�W�M=���s#��I��Q����м(-���FAc�o�~S��Ͱ��щ1J\����XeWҢ�!62���% ��-    �J���-mbc9��bd��lH'* ܁Ya�K��>�_��0y"�`��w��+�@�Li��TFѿ{+�B�P=@��]b'���7��`�uD ���a�D3p��+�
�n��=��Y����Ud����_a����A@l$���1�SE�����j�f#q��������:��B%a��g2i�T�U���Q��I���}�TY.��A_��5G����K�z+�1�rs0ɂ��ٸ���!��wd�d� �w��CR<JK�Ι�X��
F� =��6����T�B0�x�*�����q�@��k���Ѯ���e�iP>L�<�"���w�S�`�R��_���)�U0��pzo�e�$�,�29p�9���������:�i4ݡ~�nD1�0+Ձz�Ḫ�-%M_�� q�-�5��;��͓�a�$YC72�u$Ř�a�Q�"��۬�~E֔��An�^7�v�u�ì��1�BW����A�M��B!�}�w�� ��-    �J���-/dc9�b���l�,* ^[a{K��U��C�0��b7���;e��/0@���؜8�ݴ���17P���:��5���w����`fx��O��p��'�p�ѐ0Nb6��M|H������H�/ő�Q@�̮Ӑ���0珧�I��k;;��N����vUq�~������k��/`*a�F5V�]�V#nK�Q�3�?^Zv�CA��/IT�g��.s1W
ݔ k���$�Q!���r �S�fv�na�Gl�p63�@�Q�0=w �
��`--�2��im�~0�q�"�$$�ƭd9"��@�.�=Ȉ��̻|�b21P O���^����J�`G�o��rz�.3��W��p��T�P ��
���u�K��Ĵ��^m�X��N�T�0��+A~O��2,"6�������\6qJ��7?mư\T���yan�rdI���w%�C�SQ2�p���@�\� A��qL�י��f��m�u1�)�eF���gD~(�!�}�B�} ��-    K���-�ec9 �b ��l�1* ��\a��K�!�l�s��0�\bc�΍��r��|�@��s
��)������ �P�����C�S*���ð`�z��^���3ݪv�p=�������]j��ր |;\BY��D|�㶛�q�G!b�����7�1�k���D1���q9	�%�5�]��l}/a}�z�Q�XH(���Q3=\�o]���g[���A�+)K����
Ǆ1F1����`�'�]}�A���!�X�ƔM� �/�8���=���rΞ��(+�N�3& Ar��7$��б�����0>k��8��H߾&�(@�A�]B���>1`��Pµ���<��b�<�B `ɿ�]P�@��<N�~�Up����;�Q��oÎ{>^���s�%I�v[�h����[��Q�Ɂ6cu$��c�1��<�Kq�2,:�Q�����z�aL��oO#c�y&���ϧQ"A��U���t\�G|A*?�:���y���.z�1$�g6�w���:Tk!�#�c* ��-    .K���-�gc9\�b~�l7* b$^a
NL�!�����0?��d��ᳩ!��2@���;y�'����P�J�FR��]�u�`j}�����;YJ^,�p:[7�ZšwmX����j.�T�%�%6�*��c�3,��f����'3A�Rّ�W��q׻�Tt�q��0e��4a[Н}E�Zm1���QQh�":��q\�AAy��:#ML�Hj��41�9:6,\��_i^*��!_�,x ��+�� ��3�J��4,f�c�k
�*� ��M���nW�o�0�dl�L ��YD+�p@�TD�3��� �]R�P�jo��E��=��79%`K����jF��p@ �s&*���9��p��X2 Y�$��1�ںZ���?=b$D����&v	>���*ƀ!aq��<?�۰�{�:�]a*�>{U���{'��,��Q@P��v�ĳ���n�A��>)K0�������\a1����r^�`�i1*�~!��5��0� ��-    LK���-uic9��b�-�l`<* �_a��L�]N�ԇp�0��fS���+d�@�(~mp0�7`d�"�CPE���?S`��8Q��`�P�2M��~���p�n��׌�U}Fa4	�X!TgV�C(�m�+��[NX҄�cc�������� ��quZ&Î���L׫�9a9���G9�\�:�m��Qo�n���Ѕ�z]N��Aה/JO����ə�7�11��������AK{�v@!=�h)�6 ��$��z��)T��K��o���k��!� EAr�G��{ζM20�]A
�`n�`~��/	�@�gs�-��&��Z�PFn*yV���s�_0J`�|ɻ��̱P�`�}�p��]�~��WT�򂀥"��� ��!��m��vs��rw����)0s�5{t�ăvq$8�>�3f�"J`Y@�aX��[��}(�De>QQ^_q�l�cІ��⽕JA�Ѥ�\�}L���?�1`{�v�E�:�' ��!�o�F�Y� ��-    jK���-7kc9Ԗb:H�l�A* f;aa� M��z��*�0�4ug�.�o�?2c5@�_�a���U�2�F��P��Rx�n�m�x,dq`n�\���w�$ŗ��p�%>\ST�3�4k��F�y^��a0�)�󐷋���=y��/G�+�V�+[�q���u�#�~� �>a�j�-�^�C�#&Q���x�&�G*�^�@A5z�YQD�))��:�1�hi�×]�#$-�DM�!��(�� �ì�%��u���ט$��ɓ��3 Ǩ�F����gE�+n0W�t��>OO4/@�z��O�`�D0�#XrOP���n�,�|lǇ'o`O[�jq����Y���t�p�@WF�3�����L�����Gܑ��N�� ��8��N��8�P�P+���P�
	�qº&A?��d�DBw�Ba�$
�a�,�)����Q|n����Q�Hy�%ȼ�AD�&�����q"M1������+��xl�3Q!j[�p�. ��-    �K���-�lc9�b�b�l�F* ��bar�M��ԛ��0��h����MN<T ��@����R���s� xjݡP�Tٰ�|����&D\`���4� �ʑxM��pE׊�����"ǡ,�4L����l�@׻�y�T�M�m����	�����x���Oq���`[%�e�%9]�Ca�R8	�!�`�L�٩(Q�选%Ю�	��_��A�_MiS�࠙�l�=�1m <�5�e��#�!�_ዯ' ��4SB;,�Y�{�zE@29�
'��� I}���H�S��	�0FP��܈J����8UI@���Xq��bMGtUPʈ-�dp�������`�9'�X�DcN�l9pї/縫�`?�9������n����|���6���Nד���$�-�F͠9&-MH�q`=zC�b{���)e��a��o�g����*��֬�Q�}c�K?�
\�h��A�dq�^�I��夓2�1�r��x3�&���v�!H��)<�� ��-    �K���-�nc9L�b�|�l2L* jRda��M�7���%��0Go,jo	E�+��h��7@��DU�ё�^��PP��!_���)+��7$G`r��pJ$����+�p��D�K��z�}A�
"�Ǟ瑝��7X߃�;����b�}Ȧ��"��Z��!}ՁqO6���Aa��.��Iaӻ-��bV�-BQ�
Ӭ6��7�`&5>A�D�xU<�"
�U�@e1���Z������^�.!ס=6�� �{��Q�>��:�<���M�B������ �w7�i�`��@3 ��0�I��霸��NDZ={�@�� +���рj	�R��P�=�\Z��8�F���`S#�����l)Cc�pHa��=B�>��� ����-%������ֆՐ��_�p-�U�/^�����QO���q���E?���?��i'a��ըmq]��+�EdOQ����h-��>��
�A ����l�2����81:�I���h�n��#!&a��Ԇ ��-    �K���-}pc9��bT��lxQ* ��eab]N�� �ԯV�0��k#��	��|�I�@��35�ѯD�E���PM7�!D���^9�I2`�\�ٞ'�Ql߸خp�?U�&Ȫ�ͼ�,�V��C�c����zo�K��[�C�V�۔V��l�ܸ�F�q��l�'���yt��,Na�$�Pp	�d&_F�[Q�?�x���Ѝ��anN�AO*k�W��zG?�C81�/0�&q���������!��Y�< �WD�f�3"lG]L� eb�z�����? M���@��,��!0�B����&����A��@��/��\ў��P"�PN��P����2���`��@x��䱀v�kjZ�p����ء'v��Z̀�J�Xvo�*`��9t�~���ç�j�,2��=ћq��q�B!H����*���̙a��;�s����,}�G�Q֛U׼�Ў!��1�A^�=����~���ʮ1�iv�_��3�X��!��2 ��-    �K���-?rc9ėb���l�V* niga��N�s-�90˩�l� [���V�j�:@�;e&����}k,֪�P_LkZ����y�[�`v��C�*��:ْnͣpt�KjDr�����Evl��߿úG��������J޴��J�9a)�B�^�_���q�s�=Mٰ+�JSa���t:��fKh6�4uQk�-fF�OE�b�g<A����X4�&�(�F1G��A�P�+��y�x!�%��C}� �3�z�|7Q�1��^y�v��A����� �F����"&!1�]0<j�Ŕᶄ9eF�!@��^��14Ѽ��fM�mP�L�E����}�'`W�^'H������QdṕY�Go���>:��ހ��
�0K�H6 ���@.]q�"�ȵu4҃\����o�q:�tJ?)�l����/a^X��y]���-t����Q������P2�XNA�@��r:��˟{u�$1v�\�����qq�-?�!⬥~�%�