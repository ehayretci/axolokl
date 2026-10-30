// UK towns and cities for the survey's "Which town or city do you live in?" type-ahead (js/survey.js).
// Answers are saved as these names. ALIASES (lower case) map other spellings, and London boroughs and areas,
// to a name in the list; for names in showAlias the suggestion reads "London (Hackney)" but saves "London".
(() => {
  const NAMES = [
    // cities
    'London', 'Bath', 'Birmingham', 'Bradford', 'Brighton', 'Bristol', 'Cambridge', 'Canterbury', 'Carlisle', 'Chelmsford',
    'Chester', 'Chichester', 'Colchester', 'Coventry', 'Derby', 'Doncaster', 'Durham', 'Ely', 'Exeter', 'Gloucester', 'Hereford',
    'Hull', 'Lancaster', 'Leeds', 'Leicester', 'Lichfield', 'Lincoln', 'Liverpool', 'Manchester', 'Milton Keynes',
    'Newcastle upon Tyne', 'Norwich', 'Nottingham', 'Oxford', 'Peterborough', 'Plymouth', 'Portsmouth', 'Preston', 'Ripon',
    'Salford', 'Salisbury', 'Sheffield', 'Southampton', 'Southend-on-Sea', 'St Albans', 'Stoke-on-Trent', 'Sunderland', 'Truro',
    'Wakefield', 'Wells', 'Winchester', 'Wolverhampton', 'Worcester', 'York',
    'Aberdeen', 'Dundee', 'Dunfermline', 'Edinburgh', 'Glasgow', 'Inverness', 'Perth', 'Stirling',
    'Bangor (Wales)', 'Cardiff', 'Newport', 'St Asaph', 'St Davids', 'Swansea', 'Wrexham',
    'Armagh', 'Belfast', 'Derry', 'Lisburn', 'Newry',
    // towns, England
    'Abingdon', 'Accrington', 'Aldershot', 'Alnwick', 'Alton', 'Altrincham', 'Amersham', 'Andover', 'Ashbourne', 'Ashby-de-la-Zouch',
    'Ashford', 'Ashington', 'Atherstone', 'Aylesbury', 'Bakewell', 'Banbury', 'Barnard Castle', 'Barnsley', 'Barnstaple',
    'Barrow-in-Furness', 'Basildon', 'Basingstoke', 'Batley', 'Beaconsfield', 'Bedford', 'Beeston', 'Belper', 'Berwick-upon-Tweed',
    'Beverley', 'Bexhill-on-Sea', 'Bicester', 'Bideford', 'Biggleswade', 'Billericay', 'Birkenhead', 'Bishop Auckland',
    "Bishop's Stortford", 'Blackburn', 'Blackpool', 'Blyth', 'Bognor Regis', 'Bolton', 'Bootle', 'Boston', 'Bournemouth',
    'Bracknell', 'Braintree', 'Brentwood', 'Bridgnorth', 'Bridgwater', 'Bridlington', 'Brighouse', 'Brixham', 'Broadstairs',
    'Bromsgrove', 'Burgess Hill', 'Burnley', 'Burton upon Trent', 'Bury', 'Bury St Edmunds', 'Buxton', 'Camberley', 'Cannock',
    'Canvey Island', 'Castleford', 'Chatham', 'Cheltenham', 'Chesham', 'Chester-le-Street', 'Chesterfield', 'Chippenham',
    'Chipping Norton', 'Chorley', 'Christchurch', 'Cirencester', 'Clacton-on-Sea', 'Clitheroe', 'Coalville', 'Congleton', 'Consett',
    'Corby', 'Cramlington', 'Crawley', 'Crewe', 'Cromer', 'Darlington', 'Dartford', 'Daventry', 'Deal', 'Devizes', 'Dewsbury',
    'Didcot', 'Diss', 'Dorchester', 'Dorking', 'Dover', 'Droitwich', 'Dudley', 'Dunstable', 'East Grinstead', 'Eastbourne',
    'Eastleigh', 'Egham', 'Epsom', 'Evesham', 'Exmouth', 'Falmouth', 'Fareham', 'Farnborough', 'Farnham', 'Faversham',
    'Felixstowe', 'Folkestone', 'Frome', 'Gainsborough', 'Gateshead', 'Gillingham', 'Glastonbury', 'Glossop', 'Godalming',
    'Goole', 'Gosport', 'Grantham', 'Gravesend', 'Great Yarmouth', 'Grimsby', 'Guildford', 'Guisborough', 'Halesowen', 'Halifax',
    'Harlow', 'Harpenden', 'Harrogate', 'Hartlepool', 'Haslemere', 'Hastings', 'Hatfield', 'Haverhill', 'Haywards Heath',
    'Hebden Bridge', 'Hemel Hempstead', 'Henley-on-Thames', 'Herne Bay', 'Hertford', 'Hexham', 'High Wycombe', 'Hinckley',
    'Hitchin', 'Holmfirth', 'Horsham', 'Huddersfield', 'Hunstanton', 'Huntingdon', 'Ilfracombe', 'Ilkeston', 'Ilkley', 'Ipswich',
    'Jarrow', 'Keighley', 'Kendal', 'Kenilworth', 'Keswick', 'Kettering', 'Kidderminster', "King's Lynn", 'Knaresborough',
    'Knutsford', 'Leamington Spa', 'Leatherhead', 'Leek', 'Leighton Buzzard', 'Letchworth', 'Lewes', 'Leyland', 'Littlehampton',
    'Long Eaton', 'Loughborough', 'Loughton', 'Louth', 'Lowestoft', 'Ludlow', 'Luton', 'Lutterworth', 'Lymington', 'Macclesfield',
    'Maidenhead', 'Maidstone', 'Malvern', 'Mansfield', 'March', 'Margate', 'Market Harborough', 'Marlow', 'Matlock',
    'Melton Mowbray', 'Middlesbrough', 'Minehead', 'Morecambe', 'Morpeth', 'Nantwich', 'Newark-on-Trent', 'Newbury',
    'Newcastle-under-Lyme', 'Newmarket', 'Newquay', 'Newton Abbot', 'Northallerton', 'Northampton', 'Northwich', 'Nuneaton',
    'Oakham', 'Oldham', 'Ormskirk', 'Oswestry', 'Otley', 'Paignton', 'Penrith', 'Penzance', 'Petersfield', 'Pontefract', 'Poole',
    'Ramsgate', 'Rayleigh', 'Reading', 'Redcar', 'Redditch', 'Redhill', 'Reigate', 'Retford', 'Ringwood', 'Rochdale', 'Rochester',
    'Romsey', 'Rotherham', 'Rugby', 'Runcorn', 'Scarborough', 'Scunthorpe', 'Seaford', 'Selby', 'Sevenoaks', 'Sheringham',
    'Shrewsbury', 'Sittingbourne', 'Skegness', 'Skelmersdale', 'Skipton', 'Slough', 'Solihull', 'South Shields', 'Southport',
    'Spalding', 'St Helens', 'St Ives', 'St Neots', 'Stafford', 'Staines-upon-Thames', 'Stamford', 'Stevenage', 'Stockport',
    'Stockton-on-Tees', 'Stone', 'Stourbridge', 'Stowmarket', 'Stratford-upon-Avon', 'Stroud', 'Sudbury', 'Sutton Coldfield',
    'Swindon', 'Tamworth', 'Taunton', 'Telford', 'Tenterden', 'Thame', 'Thetford', 'Thirsk', 'Tiverton', 'Todmorden', 'Tonbridge',
    'Torquay', 'Totnes', 'Tring', 'Trowbridge', 'Tunbridge Wells', 'Tynemouth', 'Uttoxeter', 'Wallingford', 'Wallsend', 'Walsall',
    'Walton-on-Thames', 'Wantage', 'Warrington', 'Warwick', 'Washington', 'Watford', 'Wellingborough', 'Welwyn Garden City',
    'West Bromwich', 'Weston-super-Mare', 'Weybridge', 'Weymouth', 'Whitby', 'Whitehaven', 'Whitley Bay', 'Whitstable', 'Wickford',
    'Widnes', 'Wigan', 'Wilmslow', 'Windermere', 'Windsor', 'Wisbech', 'Witney', 'Woking', 'Wokingham', 'Woodbridge', 'Workington',
    'Worksop', 'Worthing', 'Yeovil',
    // towns, Scotland
    'Airdrie', 'Arbroath', 'Ayr', 'Coatbridge', 'Cumbernauld', 'Dalkeith', 'Dumfries', 'East Kilbride', 'Elgin', 'Falkirk',
    'Fort William', 'Galashiels', 'Glenrothes', 'Greenock', 'Hamilton', 'Irvine', 'Kilmarnock', 'Kirkcaldy', 'Kirkwall', 'Lerwick',
    'Livingston', 'Montrose', 'Motherwell', 'Musselburgh', 'Oban', 'Paisley', 'Peebles', 'St Andrews', 'Stornoway',
    // towns, Wales
    'Abergavenny', 'Aberystwyth', 'Barry', 'Brecon', 'Bridgend', 'Caernarfon', 'Caerphilly', 'Carmarthen', 'Chepstow', 'Colwyn Bay',
    'Cwmbran', 'Haverfordwest', 'Holyhead', 'Llandudno', 'Llanelli', 'Merthyr Tydfil', 'Mold', 'Monmouth', 'Neath', 'Newtown',
    'Pembroke', 'Pontypridd', 'Port Talbot', 'Rhyl', 'Tenby', 'Welshpool',
    // towns, Northern Ireland
    'Antrim', 'Ballymena', 'Banbridge', 'Bangor (Northern Ireland)', 'Carrickfergus', 'Coleraine', 'Craigavon', 'Downpatrick',
    'Dungannon', 'Enniskillen', 'Holywood', 'Larne', 'Newtownabbey', 'Newtownards', 'Omagh', 'Portadown', 'Strabane',
    // islands
    'Guernsey', 'Isle of Man', 'Jersey',
  ];

  const LONDON = ['barking', 'dagenham', 'barking and dagenham', 'barnet', 'bexley', 'brent', 'bromley', 'camden', 'croydon', 'ealing',
    'enfield', 'greenwich', 'hackney', 'hammersmith', 'fulham', 'hammersmith and fulham', 'haringey', 'harrow', 'havering',
    'hillingdon', 'hounslow', 'islington', 'kensington', 'chelsea', 'kensington and chelsea', 'kingston upon thames', 'kingston',
    'lambeth', 'lewisham', 'merton', 'newham', 'redbridge', 'richmond', 'richmond upon thames', 'southwark', 'sutton',
    'tower hamlets', 'waltham forest', 'wandsworth', 'westminster', 'city of london', 'the city',
    'acton', 'angel', 'balham', 'battersea', 'bermondsey', 'bethnal green', 'bloomsbury', 'bow', 'brixton', 'camberwell',
    'canary wharf', 'catford', 'chiswick', 'clapham', 'dalston', 'deptford', 'dulwich', "earl's court", 'earls court',
    'elephant and castle', 'euston', 'finsbury park', 'forest hill', 'hackney wick', 'hampstead', 'herne hill', 'highbury',
    'highgate', 'holborn', 'holloway', 'homerton', 'ilford', 'kennington', 'kentish town', "king's cross", 'kings cross',
    'marylebone', 'mayfair', 'mile end', 'new cross', 'notting hill', 'paddington', 'peckham', 'poplar', 'putney', 'romford',
    "shepherd's bush", 'shepherds bush', 'shoreditch', 'soho', 'south kensington', 'stockwell', 'stoke newington', 'stratford',
    'streatham', 'tooting', 'tottenham', 'uxbridge', 'vauxhall', 'walthamstow', 'wembley', 'whitechapel', 'white city',
    'wimbledon', 'wood green', 'woolwich', 'greater london'];

  const ALIASES = Object.fromEntries(LONDON.map((a) => [a, 'London']));
  Object.assign(ALIASES, {
    'kingston upon hull': 'Hull', newcastle: 'Newcastle upon Tyne', 'newcastle upon tyne': 'Newcastle upon Tyne',
    'newcastle under lyme': 'Newcastle-under-Lyme', stoke: 'Stoke-on-Trent', 'stoke on trent': 'Stoke-on-Trent',
    southend: 'Southend-on-Sea', 'southend on sea': 'Southend-on-Sea', 'royal tunbridge wells': 'Tunbridge Wells',
    'brighton and hove': 'Brighton', hove: 'Brighton', leamington: 'Leamington Spa', 'royal leamington spa': 'Leamington Spa',
    mk: 'Milton Keynes', 'weston super mare': 'Weston-super-Mare', burton: 'Burton upon Trent', londonderry: 'Derry',
    bangor: 'Bangor (Wales)', manc: 'Manchester', brum: 'Birmingham', 'st. albans': 'St Albans', 'saint albans': 'St Albans',
    'st. andrews': 'St Andrews', 'saint andrews': 'St Andrews', 'st. helens': 'St Helens', 'stratford upon avon': 'Stratford-upon-Avon',
    'kings lynn': "King's Lynn", 'bishops stortford': "Bishop's Stortford", 'welwyn': 'Welwyn Garden City', 'douglas': 'Isle of Man',
  });
  window.AXO_UK_PLACES = { NAMES, ALIASES, showAlias: ['London'] };
})();
