// Local logo mapping for major companies
const localLogos: Record<string, string> = {
  'NVDA': '/logos/nvidia.svg',
  'MSFT': '/logos/microsoft.svg',
  'AAPL': '/logos/apple.svg',
  'AMZN': '/logos/amazon.svg',
  'GOOGL': '/logos/google.svg',
  'GOOG': '/logos/google.svg',
  'META': '/logos/meta.svg',
  'TSLA': '/logos/tesla.svg',
  'JPM': '/logos/jpmorgan.png',
  'WMT': '/logos/walmart.png',
  'LLY': '/logos/lilly.png',
  'ORCL': '/logos/oracle.png',
  'V': '/logos/visa.png',
  'MA': '/logos/mastercard.png',
  'NFLX': '/logos/netflix.png',
  'XOM': '/logos/exxon.png',
  'COST': '/logos/costco.png',
  'JNJ': '/logos/jnj.png',
  'HD': '/logos/homedepot.png',
  'PLTR': '/logos/palantir.png',
  'PG': '/logos/pg.png',
  'BAC': '/logos/bofa.png',
  'ABBV': '/logos/abbvie.png',
  'CVX': '/logos/chevron.png',
  'KO': '/logos/coca-cola.png',
  'AMD': '/logos/amd.png',
  'GE': '/logos/ge.png',
  'CSCO': '/logos/cisco.png',
  'TMUS': '/logos/tmobile.png',
  'WFC': '/logos/wellsfargo.png',
  'CRM': '/logos/salesforce.png',
  'PM': '/logos/philipmorris.png',
  'IBM': '/logos/ibm.png',
  'UNH': '/logos/unitedhealth.png',
  'MS': '/logos/morganstanley.png',
  'GS': '/logos/goldmansachs.png',
  'INTU': '/logos/intuit.png',
  'LIN': '/logos/linde.png',
  'ABT': '/logos/abbott.png',
  'AXP': '/logos/amex.png',
  'BX': '/logos/blackstone.png',
  'DIS': '/logos/disney.png',
  'MCD': '/logos/mcdonalds.png',
  'RTX': '/logos/rtx.png',
  'NOW': '/logos/servicenow.png',
  'MRK': '/logos/merck.png',
  'CAT': '/logos/caterpillar.png',
  'T': '/logos/att.png',
  'PEP': '/logos/pepsico.png',
  'UBER': '/logos/uber.png',
  'BKNG': '/logos/booking.png',
  'TMO': '/logos/thermofisher.png',
  'VZ': '/logos/verizon.png',
  'SCHW': '/logos/schwab.png',
  'ISRG': '/logos/intuitive.png',
  'QCOM': '/logos/qualcomm.png',
  'C': '/logos/citi.png',
  'TXN': '/logos/ti.png',
  'BA': '/logos/boeing.png',
  'BLK': '/logos/blackrock.png',
  'ACN': '/logos/accenture.png',
  'SPGI': '/logos/spglobal.png',
  'AMGN': '/logos/amgen.png',
  'ADBE': '/logos/adobe.png',
  'BSX': '/logos/bostonscientific.png',
  'SYK': '/logos/stryker.png',
  'ETN': '/logos/eaton.png',
  'AMAT': '/logos/appliedmaterials.png',
  'ANET': '/logos/arista.png',
  'NEE': '/logos/nextera.png',
  'DHR': '/logos/danaher.png',
  'HON': '/logos/honeywell.png',
  'TJX': '/logos/tjx.png',
  'PGR': '/logos/progressive.png',
  'GILD': '/logos/gilead.png',
  'DE': '/logos/deere.png',
  'PFE': '/logos/pfizer.png',
  'COF': '/logos/capitalone.png',
  'KKR': '/logos/kkr.png',
  'PANW': '/logos/paloalto.png',
  'UNP': '/logos/unionpacific.png',
  'APH': '/logos/amphenol.png',
  'LOW': '/logos/lowes.png',
  'LRCX': '/logos/lamresearch.png',
  'MU': '/logos/micron.png',
  'ADP': '/logos/adp.png',
  'CMCSA': '/logos/comcast.png',
  'COP': '/logos/conocophillips.png',
  'KLAC': '/logos/kla.png',
  'VRTX': '/logos/vertex.png',
  'MDT': '/logos/medtronic.png',
  'SNPS': '/logos/synopsys.png',
  'NKE': '/logos/nike.png',
  'CRWD': '/logos/crowdstrike.png',
  'ADI': '/logos/analog.png',
  'WELL': '/logos/welltower.png',
  'CB': '/logos/chubb.png',
  'ICE': '/logos/ice.png',
  'SBUX': '/logos/starbucks.png',
  'TT': '/logos/trane.png',
  'SO': '/logos/southern.png',
  'CEG': '/logos/constellation.png',
  'PLD': '/logos/prologis.png',
  'DASH': '/logos/doordash.png',
  'AMT': '/logos/americantower.png',
  'MO': '/logos/altria.png',
  'MMC': '/logos/marsh.png',
  'CME': '/logos/cme.png',
  'CDNS': '/logos/cadence.png',
  'LMT': '/logos/lockheed.png',
  'BMY': '/logos/bms.png',
  'WM': '/logos/waste.png',
  'PH': '/logos/parker.png',
  'COIN': '/logos/coinbase.png',
  'DUK': '/logos/duke.png',
  'RCL': '/logos/royalcaribbean.png',
  'MCO': '/logos/moodys.png',
  'MDLZ': '/logos/mondelez.png',
  'DELL': '/logos/dell.png',
  'TDG': '/logos/transdigm.png',
  'CTAS': '/logos/cintas.png',
  'INTC': '/logos/intel.png',
  'MCK': '/logos/mckesson.png',
  'ABNB': '/logos/airbnb.png',
  'GD': '/logos/generaldynamics.png',
  'ORLY': '/logos/oreilly.png',
  'APO': '/logos/apollo.png',
  'SHW': '/logos/sherwin.png',
  'HCA': '/logos/hca.png',
  'EMR': '/logos/emerson.png',
  'NOC': '/logos/northrop.png',
  'MMM': '/logos/3m.png',
  'FTNT': '/logos/fortinet.png',
  'EQIX': '/logos/equinix.png',
  'CI': '/logos/cigna.png',
  'UPS': '/logos/ups.png',
  'FI': '/logos/fiserv.png',
  'HWM': '/logos/howmet.png',
  'AON': '/logos/aon.png',
  'PNC': '/logos/pnc.png',
  'CVS': '/logos/cvs.png',
  'RSG': '/logos/republic.png',
  'AJG': '/logos/ajg.png',
  'ITW': '/logos/itw.png',
  'MAR': '/logos/marriott.png',
  'ECL': '/logos/ecolab.png',
  'MSI': '/logos/motorola.png',
  'USB': '/logos/usbank.png',
  'WMB': '/logos/williams.png',
  'BK': '/logos/bnymellon.png',
  'CL': '/logos/colgate.png',
  'NEM': '/logos/newmont.png',
  'PYPL': '/logos/paypal.png',
  'JCI': '/logos/johnsoncontrols.png',
  'ZTS': '/logos/zoetis.png',
  'VST': '/logos/vistra.png',
  'EOG': '/logos/eog.png',
  'CSX': '/logos/csx.png',
  'ELV': '/logos/elevance.png',
  'ADSK': '/logos/autodesk.png',
  'APD': '/logos/airproducts.png',
  'AZO': '/logos/autozone.png',
  'HLT': '/logos/hilton.png',
  'WDAY': '/logos/workday.png',
  'SPG': '/logos/simon.png',
  'NSC': '/logos/norfolk.png',
  'KMI': '/logos/kindermorgan.png',
  'TEL': '/logos/te.png',
  'FCX': '/logos/freeport.png',
  'CARR': '/logos/carrier.png',
  'PWR': '/logos/quanta.png',
  'REGN': '/logos/regeneron.png',
  'ROP': '/logos/roper.png',
  'CMG': '/logos/chipotle.png',
  'DLR': '/logos/digitalrealty.png',
  'MNST': '/logos/monster.png',
  'TFC': '/logos/truist.png',
  'TRV': '/logos/travelers.png',
  'AEP': '/logos/aep.png',
  'NXPI': '/logos/nxp.png',
  'AXON': '/logos/axon.png',
  'URI': '/logos/unitedrentals.png',
  'COR': '/logos/cencora.png',
  'FDX': '/logos/fedex.png',
  'NDAQ': '/logos/nasdaq.png',
  'AFL': '/logos/aflac.png',
  'GLW': '/logos/corning.png',
  'FAST': '/logos/fastenal.png',
  'MPC': '/logos/marathon.png',
  'SLB': '/logos/schlumberger.png',
  'SRE': '/logos/sempra.png',
  'PAYX': '/logos/paychex.png',
  'PCAR': '/logos/paccar.png',
  'MET': '/logos/metlife.png',
  'BDX': '/logos/bd.png',
  'OKE': '/logos/oneok.png',
  'DDOG': '/logos/datadog.png',
  // International companies
  'TSM': '/logos/tsmc.png',
  'SAP': '/logos/sap.png',
  'ASML': '/logos/asml.png',
  'BABA': '/logos/alibaba.png',
  'TM': '/logos/toyota.png',
  'AZN': '/logos/astrazeneca.png',
  'HSBC': '/logos/hsbc.png',
  'NVS': '/logos/novartis.png',
  'SHEL': '/logos/shell.png',
  'HDB': '/logos/hdfc.png',
  'RY': '/logos/rbc.png',
  'NVO': '/logos/novonordisk.png',
  'ARM': '/logos/arm.png',
  'SHOP': '/logos/shopify.png',
  'MUFG': '/logos/mufg.png',
  'PDD': '/logos/pinduoduo.png',
  'UL': '/logos/unilever.png',
  'SONY': '/logos/sony.png',
  'TTE': '/logos/total.png',
  'BHP': '/logos/bhp.png',
  'SAN': '/logos/santander.png',
  'TD': '/logos/td.png',
  'SPOT': '/logos/spotify.png',
  'UBS': '/logos/ubs.png',
  'IBN': '/logos/icici.png',
  'SNY': '/logos/sanofi.png',
  'BUD': '/logos/ab-inbev.png',
  'BTI': '/logos/bat.png',
  'BN': '/logos/brookfield.png',
  'SMFG': '/logos/smfg.png',
  'ENB': '/logos/enbridge.png',
  'RELX': '/logos/relx.png',
  'TRI': '/logos/thomsonreuters.png',
  'RACE': '/logos/ferrari.png',
  'BBVA': '/logos/bbva.png',
  'SE': '/logos/sea.png',
  'BP': '/logos/bp.png',
  'NTES': '/logos/netease.png',
  'BMO': '/logos/bmo.png',
  'RIO': '/logos/riotinto.png',
  'GSK': '/logos/gsk.png',
  'MFG': '/logos/mizuho.png',
  'INFY': '/logos/infosys.png',
  'CP': '/logos/cp.png',
  'BCS': '/logos/barclays.png',
  'NGG': '/logos/nationalgrid.png',
  'BNS': '/logos/scotiabank.png',
  'ING': '/logos/ing.png',
  'EQNR': '/logos/equinor.png',
  'CM': '/logos/cibc.png',
  'CNQ': '/logos/cnrl.png',
  'LYG': '/logos/lloyds.png',
  'AEM': '/logos/agnicoeagle.png',
  'DB': '/logos/deutschebank.png',
  'NU': '/logos/nu.png',
  'CNI': '/logos/cn.png',
  'DEO': '/logos/diageo.png',
  'NWG': '/logos/natwest.png',
  'AMX': '/logos/americamovil.png',
  'MFC': '/logos/manulife.png',
  'E': '/logos/eni.png',
  'WCN': '/logos/wasteconnections.png',
  'SU': '/logos/suncor.png',
  'TRP': '/logos/tcenergy.png',
  'PBR': '/logos/petrobras.png',
  'HMC': '/logos/honda.png',
  'GRMN': '/logos/garmin.png',
  'CCEP': '/logos/coca-colaep.png',
  'ALC': '/logos/alcon.png',
  'TAK': '/logos/takeda.png'
};

// Color mapping for consistent company colors
const companyColors: Record<string, string> = {
  'NVDA': '76B900', // NVIDIA green
  'MSFT': '00A4EF', // Microsoft blue
  'AAPL': '000000', // Apple black
  'AMZN': 'FF9900', // Amazon orange
  'GOOGL': '4285F4', // Google blue
  'GOOG': '4285F4', // Google blue
  'META': '1877F2', // Meta blue
  'TSLA': 'CC0000', // Tesla red
  'TSM': '4A90E2', // TSMC blue
  'UNH': 'FF6B35', // UnitedHealth orange
  'PM': '00A651', // Philip Morris green
  'JPM': '0066CC', // JPMorgan blue
  'WMT': '007DC6', // Walmart blue
  'LLY': 'FF6B35', // Lilly orange
  'ORCL': 'F80000', // Oracle red
  'V': '1A1F71', // Visa blue
  'MA': 'FF5F00', // Mastercard orange
  'NFLX': 'E50914', // Netflix red
  'XOM': 'ED1C24', // Exxon red
  'COST': 'FF6600', // Costco orange
  'JNJ': 'FF6B35', // Johnson & Johnson orange
  'HD': 'FF6600', // Home Depot orange
  'PLTR': '000000', // Palantir black
  'PG': '0066CC', // Procter & Gamble blue
  'BAC': 'D70040', // Bank of America red
  'ABBV': '00A3E0', // AbbVie blue
  'CVX': '86BC25', // Chevron green
  'KO': 'ED1C24', // Coca-Cola red
  'AMD': 'ED1C24', // AMD red
  'GE': '0066CC', // GE blue
  'CSCO': '1BA0D7', // Cisco blue
  'TMUS': 'E20074', // T-Mobile pink
  'WFC': 'D71E28', // Wells Fargo red
  'CRM': '1798C1', // Salesforce blue
  'IBM': '006699', // IBM blue
  'MS': 'D70040', // Morgan Stanley red
  'GS': 'D70040', // Goldman Sachs red
  'INTU': '2C8EBB', // Intuit blue
  'LIN': '0066CC', // Linde blue
  'ABT': '0066CC', // Abbott blue
  'AXP': '0066CC', // American Express blue
  'BX': '000000', // Blackstone black
  'DIS': '0063E1', // Disney blue
  'MCD': 'FFC72C', // McDonald's yellow
  'RTX': '0066CC', // RTX blue
  'NOW': '00A3E0', // ServiceNow blue
  'MRK': '0066CC', // Merck blue
  'CAT': 'FF6600', // Caterpillar orange
  'T': '0066CC', // AT&T blue
  'PEP': '0066CC', // PepsiCo blue
  'UBER': '000000', // Uber black
  'BKNG': '003580', // Booking blue
  'TMO': '0066CC', // Thermo Fisher blue
  'VZ': 'EE0000', // Verizon red
  'SCHW': '0066CC', // Schwab blue
  'ISRG': '0066CC', // Intuitive blue
  'QCOM': '0066CC', // Qualcomm blue
  'C': '0066CC', // Citigroup blue
  'TXN': '0066CC', // Texas Instruments blue
  'BA': '0066CC', // Boeing blue
  'BLK': '000000', // BlackRock black
  'ACN': '0066CC', // Accenture blue
  'SPGI': '0066CC', // S&P Global blue
  'AMGN': '0066CC', // Amgen blue
  'ADBE': 'FF0000', // Adobe red
  'BSX': '0066CC', // Boston Scientific blue
  'SYK': '0066CC', // Stryker blue
  'ETN': '0066CC', // Eaton blue
  'AMAT': '0066CC', // Applied Materials blue
  'ANET': '0066CC', // Arista blue
  'NEE': '0066CC', // NextEra blue
  'DHR': '0066CC', // Danaher blue
  'HON': '0066CC', // Honeywell blue
  'TJX': '0066CC', // TJX blue
  'PGR': '0066CC', // Progressive blue
  'GILD': '0066CC', // Gilead blue
  'DE': '0066CC', // Deere blue
  'PFE': '0066CC', // Pfizer blue
  'COF': '0066CC', // Capital One blue
  'KKR': '000000', // KKR black
  'PANW': 'FF6600', // Palo Alto orange
  'UNP': '0066CC', // Union Pacific blue
  'APH': '0066CC', // Amphenol blue
  'LOW': '0066CC', // Lowe's blue
  'LRCX': '0066CC', // Lam Research blue
  'MU': '0066CC', // Micron blue
  'ADP': '0066CC', // ADP blue
  'CMCSA': '0066CC', // Comcast blue
  'COP': '0066CC', // ConocoPhillips blue
  'KLAC': '0066CC', // KLA blue
  'VRTX': '0066CC', // Vertex blue
  'MDT': '0066CC', // Medtronic blue
  'SNPS': '0066CC', // Synopsys blue
  'NKE': '000000', // Nike black
  'CRWD': 'FF6600', // CrowdStrike orange
  'ADI': '0066CC', // Analog Devices blue
  'WELL': '0066CC', // Welltower blue
  'CB': '0066CC', // Chubb blue
  'ICE': '0066CC', // ICE blue
  'SBUX': '0066CC', // Starbucks blue
  'TT': '0066CC', // Trane blue
  'SO': '0066CC', // Southern blue
  'CEG': '0066CC', // Constellation blue
  'PLD': '0066CC', // Prologis blue
  'DASH': 'FF6600', // DoorDash orange
  'AMT': '0066CC', // American Tower blue
  'MO': '0066CC', // Altria blue
  'MMC': '0066CC', // Marsh blue
  'CME': '0066CC', // CME blue
  'CDNS': '0066CC', // Cadence blue
  'LMT': '0066CC', // Lockheed blue
  'BMY': '0066CC', // Bristol-Myers blue
  'WM': '0066CC', // Waste Management blue
  'PH': '0066CC', // Parker blue
  'COIN': '0066CC', // Coinbase blue
  'DUK': '0066CC', // Duke blue
  'RCL': '0066CC', // Royal Caribbean blue
  'MCO': '0066CC', // Moody's blue
  'MDLZ': '0066CC', // Mondelez blue
  'DELL': '0066CC', // Dell blue
  'TDG': '0066CC', // TransDigm blue
  'CTAS': '0066CC', // Cintas blue
  'INTC': '0066CC', // Intel blue
  'MCK': '0066CC', // McKesson blue
  'ABNB': 'FF6600', // Airbnb orange
  'GD': '0066CC', // General Dynamics blue
  'ORLY': 'FF6600', // O'Reilly orange
  'APO': '000000', // Apollo black
  'SHW': '0066CC', // Sherwin-Williams blue
  'HCA': '0066CC', // HCA blue
  'EMR': '0066CC', // Emerson blue
  'NOC': '0066CC', // Northrop blue
  'MMM': '0066CC', // 3M blue
  'FTNT': 'FF6600', // Fortinet orange
  'EQIX': '0066CC', // Equinix blue
  'CI': '0066CC', // Cigna blue
  'UPS': '351C15', // UPS brown
  'FI': '0066CC', // Fiserv blue
  'HWM': '0066CC', // Howmet blue
  'AON': '0066CC', // Aon blue
  'PNC': '0066CC', // PNC blue
  'CVS': '0066CC', // CVS blue
  'RSG': '0066CC', // Republic Services blue
  'AJG': '0066CC', // AJG blue
  'ITW': '0066CC', // ITW blue
  'MAR': '0066CC', // Marriott blue
  'ECL': '0066CC', // Ecolab blue
  'MSI': '0066CC', // Motorola blue
  'USB': '0066CC', // US Bank blue
  'WMB': '0066CC', // Williams blue
  'BK': '0066CC', // BNY Mellon blue
  'CL': '0066CC', // Colgate blue
  'NEM': 'FFD700', // Newmont gold
  'PYPL': '0066CC', // PayPal blue
  'JCI': '0066CC', // Johnson Controls blue
  'ZTS': '0066CC', // Zoetis blue
  'VST': '0066CC', // Vistra blue
  'EOG': '0066CC', // EOG blue
  'CSX': '0066CC', // CSX blue
  'ELV': '0066CC', // Elevance blue
  'ADSK': '0066CC', // Autodesk blue
  'APD': '0066CC', // Air Products blue
  'AZO': 'FF6600', // AutoZone orange
  'HLT': '0066CC', // Hilton blue
  'WDAY': '0066CC', // Workday blue
  'SPG': '0066CC', // Simon blue
  'NSC': '0066CC', // Norfolk Southern blue
  'KMI': '0066CC', // Kinder Morgan blue
  'TEL': '0066CC', // TE Connectivity blue
  'FCX': '0066CC', // Freeport-McMoRan blue
  'CARR': '0066CC', // Carrier blue
  'PWR': '0066CC', // Quanta blue
  'REGN': '0066CC', // Regeneron blue
  'ROP': '0066CC', // Roper blue
  'CMG': 'FF6600', // Chipotle orange
  'DLR': '0066CC', // Digital Realty blue
  'MNST': '0066CC', // Monster blue
  'TFC': '0066CC', // Truist blue
  'TRV': '0066CC', // Travelers blue
  'AEP': '0066CC', // AEP blue
  'NXPI': '0066CC', // NXP blue
  'AXON': '0066CC', // Axon blue
  'URI': 'FF6600', // United Rentals orange
  'COR': '0066CC', // Cencora blue
  'FDX': '660099', // FedEx purple
  'NDAQ': '0066CC', // Nasdaq blue
  'AFL': '0066CC', // Aflac blue
  'GLW': '0066CC', // Corning blue
  'FAST': 'FF6600', // Fastenal orange
  'MPC': '0066CC', // Marathon blue
  'SLB': '0066CC', // Schlumberger blue
  'SRE': '0066CC', // Sempra blue
  'PAYX': '0066CC', // Paychex blue
  'PCAR': '0066CC', // PACCAR blue
  'MET': '0066CC', // MetLife blue
  'BDX': '0066CC', // BD blue
  'OKE': '0066CC', // Oneok blue
  'DDOG': '0066CC', // Datadog blue
  // International companies
  'SAP': '0066CC', // SAP blue
  'ASML': '0066CC', // ASML blue
  'BABA': 'FF6600', // Alibaba orange
  'TM': 'FF0000', // Toyota red
  'AZN': '0066CC', // AstraZeneca blue
  'HSBC': 'DB0011', // HSBC red
  'NVS': '0066CC', // Novartis blue
  'SHEL': 'FF6600', // Shell orange
  'HDB': '0066CC', // HDFC blue
  'RY': '0066CC', // RBC blue
  'NVO': '0066CC', // Novo Nordisk blue
  'ARM': '0066CC', // ARM blue
  'SHOP': '0066CC', // Shopify blue
  'MUFG': '0066CC', // MUFG blue
  'PDD': 'FF6600', // Pinduoduo orange
  'UL': '0066CC', // Unilever blue
  'SONY': '000000', // Sony black
  'TTE': '0066CC', // Total blue
  'BHP': '0066CC', // BHP blue
  'SAN': 'DB0011', // Santander red
  'TD': '0066CC', // TD blue
  'SPOT': '1DB954', // Spotify green
  'UBS': '0066CC', // UBS blue
  'IBN': '0066CC', // ICICI blue
  'SNY': '0066CC', // Sanofi blue
  'BUD': 'FF6600', // AB InBev orange
  'BTI': '0066CC', // BAT blue
  'BN': '0066CC', // Brookfield blue
  'SMFG': '0066CC', // SMFG blue
  'ENB': '0066CC', // Enbridge blue
  'RELX': '0066CC', // RELX blue
  'TRI': '0066CC', // Thomson Reuters blue
  'RACE': 'FF0000', // Ferrari red
  'BBVA': '0066CC', // BBVA blue
  'SE': 'FF6600', // Sea orange
  'BP': '0066CC', // BP blue
  'NTES': '0066CC', // NetEase blue
  'BMO': '0066CC', // BMO blue
  'RIO': '0066CC', // Rio Tinto blue
  'GSK': '0066CC', // GSK blue
  'MFG': '0066CC', // Mizuho blue
  'INFY': '0066CC', // Infosys blue
  'CP': '0066CC', // CP blue
  'BCS': '0066CC', // Barclays blue
  'NGG': '0066CC', // National Grid blue
  'BNS': '0066CC', // Scotiabank blue
  'ING': 'FF6600', // ING orange
  'EQNR': '0066CC', // Equinor blue
  'CM': '0066CC', // CIBC blue
  'CNQ': '0066CC', // CNRL blue
  'LYG': '0066CC', // Lloyds blue
  'AEM': 'FFD700', // Agnico Eagle gold
  'DB': '0066CC', // Deutsche Bank blue
  'NU': '0066CC', // Nu blue
  'CNI': '0066CC', // CN blue
  'DEO': '0066CC', // Diageo blue
  'NWG': '0066CC', // NatWest blue
  'AMX': '0066CC', // America Movil blue
  'MFC': '0066CC', // Manulife blue
  'E': '0066CC', // Eni blue
  'WCN': '0066CC', // Waste Connections blue
  'SU': '0066CC', // Suncor blue
  'TRP': '0066CC', // TC Energy blue
  'PBR': '0066CC', // Petrobras blue
  'HMC': 'FF0000', // Honda red
  'GRMN': '0066CC', // Garmin blue
  'CCEP': 'FF0000', // Coca-Cola EP red
  'ALC': '0066CC', // Alcon blue
  'TAK': '0066CC' // Takeda blue
};

export function getLogoUrl(ticker: string): string {
  // Get company color or use default blue
  const color = companyColors[ticker] || '0066CC';
  
  // Use ui-avatars.com with consistent company colors
  return `https://ui-avatars.com/api/?name=${ticker}&background=${color}&size=32&color=fff&font-size=0.4&bold=true&format=svg`;
} 