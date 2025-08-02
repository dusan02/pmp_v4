#!/usr/bin/env tsx

import fs from 'fs/promises';
import path from 'path';
import sharp from 'sharp';
import * as si from 'simple-icons';

// Import our existing ticker mappings
const TICKER_DOMAINS: Record<string, string> = {
  // Top US Tech & Major Companies
  'NVDA': 'nvidia.com',
  'MSFT': 'microsoft.com',
  'AAPL': 'apple.com',
  'AMZN': 'amazon.com',
  'GOOGL': 'google.com',
  'GOOG': 'google.com',
  'META': 'meta.com',
  'AVGO': 'broadcom.com',
  'BRK.A': 'berkshirehathaway.com',
  'BRK.B': 'berkshirehathaway.com',
  'BRKA': 'berkshirehathaway.com',
  'BRKB': 'berkshirehathaway.com',
  'TSLA': 'tesla.com',
  'JPM': 'jpmorganchase.com',
  'WMT': 'walmart.com',
  'LLY': 'lilly.com',
  'ORCL': 'oracle.com',
  'V': 'visa.com',
  'MA': 'mastercard.com',
  'NFLX': 'netflix.com',
  'XOM': 'exxonmobil.com',
  'COST': 'costco.com',
  'JNJ': 'jnj.com',
  'HD': 'homedepot.com',
  'PLTR': 'palantir.com',
  'PG': 'pg.com',
  'BAC': 'bankofamerica.com',
  'ABBV': 'abbvie.com',
  'CVX': 'chevron.com',
  'KO': 'coca-cola.com',
  'AMD': 'amd.com',
  'GE': 'ge.com',
  'CSCO': 'cisco.com',
  'TMUS': 't-mobile.com',
  'WFC': 'wellsfargo.com',
  'CRM': 'salesforce.com',
  'PM': 'pmi.com',
  'IBM': 'ibm.com',
  'UNH': 'unitedhealthgroup.com',
  'MS': 'morganstanley.com',
  'GS': 'goldmansachs.com',
  'INTU': 'intuit.com',
  'LIN': 'linde.com',
  'ABT': 'abbott.com',
  'AXP': 'americanexpress.com',
  'BX': 'blackstone.com',
  'DIS': 'disney.com',
  'MCD': 'mcdonalds.com',
  'RTX': 'rtx.com',
  'NOW': 'servicenow.com',
  'MRK': 'merck.com',
  'CAT': 'caterpillar.com',
  'T': 'att.com',
  'PEP': 'pepsi.com',
  'UBER': 'uber.com',
  'BKNG': 'booking.com',
  'TMO': 'thermofisher.com',
  'VZ': 'verizon.com',
  'SCHW': 'schwab.com',
  'ISRG': 'intuitive.com',
  'QCOM': 'qualcomm.com',
  'C': 'citigroup.com',
  'TXN': 'ti.com',
  'BA': 'boeing.com',
  'BLK': 'blackrock.com',
  'ACN': 'accenture.com',
  'SPGI': 'spglobal.com',
  'AMGN': 'amgen.com',
  'ADBE': 'adobe.com',
  'BSX': 'bostonscientific.com',
  'SYK': 'stryker.com',
  'ETN': 'eaton.com',
  'AMAT': 'appliedmaterials.com',
  'ANET': 'arista.com',
  'NEE': 'nexteraenergy.com',
  'DHR': 'danaher.com',
  'HON': 'honeywell.com',
  'TJX': 'tjx.com',
  'PGR': 'progressive.com',
  'GILD': 'gilead.com',
  'DE': 'deere.com',
  'PFE': 'pfizer.com',
  'COF': 'capitalone.com',
  'KKR': 'kkr.com',
  'PANW': 'paloaltonetworks.com',
  'UNP': 'up.com',
  'APH': 'amphenol.com',
  'LOW': 'lowes.com',
  'LRCX': 'lamresearch.com',
  'MU': 'micron.com',
  'ADP': 'adp.com',
  'CMCSA': 'comcast.com',
  'COP': 'conocophillips.com',
  'KLAC': 'kla.com',
  'VRTX': 'vrtx.com',
  'MDT': 'medtronic.com',
  'SNPS': 'synopsys.com',
  'NKE': 'nike.com',
  'CRWD': 'crowdstrike.com',
  'ADI': 'analog.com',
  'WELL': 'welltower.com',
  'CB': 'chubb.com',
  'ICE': 'ice.com',
  'SBUX': 'starbucks.com',
  'TT': 'trane.com',
  'SO': 'southerncompany.com',
  'CEG': 'constellationenergy.com',
  'PLD': 'prologis.com',
  'DASH': 'doordash.com',
  'AMT': 'americantower.com',
  'MO': 'altria.com',
  'MMC': 'mmc.com',
  'CME': 'cmegroup.com',
  'CDNS': 'cadence.com',
  'LMT': 'lockheedmartin.com',
  'BMY': 'bms.com',
  'WM': 'wm.com',
  'PH': 'parker.com',
  'COIN': 'coinbase.com',
  'DUK': 'duke-energy.com',
  'RCL': 'rcl.com',
  'MCO': 'moodys.com',
  'MDLZ': 'mondelez.com',
  'DELL': 'dell.com',
  'TDG': 'transdigm.com',
  'CTAS': 'cintas.com',
  'INTC': 'intel.com',
  'MCK': 'mckesson.com',
  'ABNB': 'airbnb.com',
  'GD': 'gd.com',
  'ORLY': 'oreillyauto.com',
  'APO': 'apollo.com',
  'SHW': 'sherwin-williams.com',
  'HCA': 'hcahealthcare.com',
  'EMR': 'emerson.com',
  'NOC': 'northropgrumman.com',
  'MMM': '3m.com',
  'FTNT': 'fortinet.com',
  'EQIX': 'equinix.com',
  'CI': 'cigna.com',
  'UPS': 'ups.com',
  'FI': 'fiserv.com',
  'HWM': 'howmet.com',
  'AON': 'aon.com',
  'PNC': 'pnc.com',
  'CVS': 'cvshealth.com',
  'RSG': 'republicservices.com',
  'AJG': 'ajg.com',
  'ITW': 'itw.com',
  'MAR': 'marriott.com',
  'ECL': 'ecolab.com',
  'MSI': 'motorolasolutions.com',
  'USB': 'usbank.com',
  'WMB': 'westernmidstream.com',
  'BK': 'bnymellon.com',
  'CL': 'colgatepalmolive.com',
  'NEM': 'newmont.com',
  'PYPL': 'paypal.com',
  'JCI': 'johnsoncontrols.com',
  'ZTS': 'zoetis.com',
  'VST': 'vistra.com',
  'EOG': 'eogresources.com',
  'CSX': 'csx.com',
  'ELV': 'elevancehealth.com',
  'ADSK': 'autodesk.com',
  'APD': 'airproducts.com',
  'AZO': 'autozone.com',
  'HLT': 'hilton.com',
  'WDAY': 'workday.com',
  'SPG': 'simon.com',
  'NSC': 'nscorp.com',
  'KMI': 'kindermorgan.com',
  'TEL': 'te.com',
  'FCX': 'freeportmcmoran.com',
  'CARR': 'carrier.com',
  'PWR': 'quanta.com',
  'REGN': 'regeneron.com',
  'ROP': 'ropertech.com',
  'CMG': 'chipotle.com',
  'DLR': 'digitalrealty.com',
  'MNST': 'monsterenergy.com',
  'TFC': 'truist.com',
  'TRV': 'travelers.com',
  'AEP': 'aep.com',
  'NXPI': 'nxp.com',
  'AXON': 'axon.com',
  'URI': 'united-rentals.com',
  'COR': 'corning.com',
  'FDX': 'fedex.com',
  'NDAQ': 'nasdaq.com',
  'AFL': 'aflac.com',
  'GLW': 'corning.com',
  'FAST': 'fastenal.com',
  'MPC': 'marathonpetroleum.com',
  'SLB': 'slb.com',
  'SRE': 'sdge.com',
  'PAYX': 'paychex.com',
  'PCAR': 'paccar.com',
  'MET': 'metlife.com',
  'BDX': 'bd.com',
  'OKE': 'oneok.com',
  'DDOG': 'datadoghq.com',

  // International Companies
  'TSM': 'tsmc.com',
  'SAP': 'sap.com',
  'ASML': 'asml.com',
  'BABA': 'alibaba.com',
  'TM': 'toyota.com',
  'AZN': 'astrazeneca.com',
  'HSBC': 'hsbc.com',
  'NVS': 'novartis.com',
  'SHEL': 'shell.com',
  'HDB': 'hdfcbank.com',
  'RY': 'rbc.com',
  'NVO': 'novonordisk.com',
  'ARM': 'arm.com',
  'SHOP': 'shopify.com',
  'MUFG': 'mufg.jp',
  'PDD': 'pdd.com',
  'UL': 'unilever.com',
  'SONY': 'sony.com',
  'TTE': 'totalenergies.com',
  'BHP': 'bhp.com',
  'SAN': 'santander.com',
  'TD': 'td.com',
  'SPOT': 'spotify.com',
  'UBS': 'ubs.com',
  'IBN': 'icicibank.com',
  'SNY': 'sanofi.com',
  'BUD': 'ab-inbev.com',
  'BTI': 'bat.com',
  'BN': 'brookfield.com',
  'SMFG': 'smfg.co.jp',
  'ENB': 'enbridge.com',
  'RELX': 'relx.com',
  'TRI': 'thomsonreuters.com',
  'RACE': 'ferrari.com',
  'BBVA': 'bbva.com',
  'SE': 'sea.com',
  'BP': 'bp.com',
  'NTES': 'netease.com',
  'BMO': 'bmo.com',
  'RIO': 'riotinto.com',
  'GSK': 'gsk.com',
  'MFG': 'mizuho-fg.com',
  'INFY': 'infosys.com',
  'CP': 'cpr.ca',
  'BCS': 'barclays.com',
  'NGG': 'nationalgrid.com',
  'BNS': 'scotiabank.com',
  'ING': 'ing.com',
  'EQNR': 'equinor.com',
  'CM': 'cibc.com',
  'CNQ': 'cnq.com',
  'LYG': 'lloydsbank.com',
  'AEM': 'agnicoeagle.com',
  'DB': 'db.com',
  'NU': 'nu.com',
  'CNI': 'cn.ca',
  'DEO': 'diageo.com',
  'NWG': 'natwestgroup.com',
  'AMX': 'americamovil.com',
  'MFC': 'manulife.com',
  'E': 'eni.com',
  'WCN': 'wasteconnections.com',
  'SU': 'suncor.com',
  'TRP': 'tcenergy.com',
  'PBR': 'petrobras.com.br',
  'HMC': 'honda.com',
  'GRMN': 'garmin.com',
  'CCEP': 'ccep.com',
  'ALC': 'alcon.com',
  'TAK': 'takeda.com',

  // Additional mappings
  'NESN': 'nestle.com',
  'ROCHE': 'roche.com',
  'NOVN': 'novartis.com',
  'MC': 'lvmh.com',
  'OR': 'loreal.com',
  'CDI': 'dior.com',
  'HERMÈS': 'hermes.com',
  'RDSA': 'shell.com',
  'GOLD': 'barrick.com',
  'VALE': 'vale.com',
  'NTR': 'nutrien.com',
  'SCCO': 'scco.com.pe',
  'CNC': 'centene.com',
  'WBA': 'walgreensbootsalliance.com',
  'HUM': 'humana.com',
  'ANTM': 'anthem.com',
  'CHRW': 'chrobinson.com',
  'XPO': 'xpo.com',
  'ODFL': 'odfl.com',
  'JBHT': 'jbhunt.com',
  'KNX': 'knight-swift.com',
  'SAIA': 'saia.com',
  'LSTR': 'landstar.com',
  'WERN': 'werner.com',
  'MATX': 'matson.com',
  'KEX': 'kirbylogistics.com',
  'HUBG': 'hubgroup.com',
  'SNDR': 'schneider.com',
  'ARCB': 'arcb.com',
  'CVTI': 'covenant.com',
  'MNTV': 'viacomcbs.com',
  'TCEHY': 'tencent.com',
  'TEAM': 'atlassian.com',
  'DXCM': 'dexcom.com',
  'DOCU': 'docusign.com',
  'ZM': 'zoom.us',
  'ROKU': 'roku.com',
  'SQ': 'squareup.com',
  'SNOW': 'snowflake.com',
  'LYFT': 'lyft.com',
  'TWLO': 'twilio.com',
  'OKTA': 'okta.com',
  'U': 'unity.com',
  'NET': 'cloudflare.com',
  'ZS': 'zscaler.com',
  'GRAB': 'grab.com',
  'MRVL': 'marvell.com'
};

interface LogoFetchResult {
  ticker: string;
  success: boolean;
  source: 'clearbit' | 'unavatar' | 'simple-icons' | 'ui-avatars';
  error?: string;
}

const LOGOS_DIR = path.join(process.cwd(), 'public', 'logos');
const BATCH_SIZE = 5; // Parallel requests
const TIMEOUT = 8000; // 8 seconds timeout

async function ensureDir(dir: string) {
  try {
    await fs.access(dir);
  } catch {
    await fs.mkdir(dir, { recursive: true });
  }
}

async function fetchWithTimeout(url: string, timeout = TIMEOUT): Promise<Response> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeout);
  
  try {
    const response = await fetch(url, { 
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; LogoCrawler/1.0)'
      }
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

async function fetchLogo(ticker: string, domain: string): Promise<LogoFetchResult> {
  console.log(`🔍 Fetching logo for ${ticker} (${domain})`);
  
  const sources = [
    {
      name: 'clearbit' as const,
      url: `https://logo.clearbit.com/${domain}?size=128&format=png`
    },
    {
      name: 'unavatar' as const,
      url: `https://unavatar.io/${domain}?fallback=false&size=128`
    }
  ];

  // Try external sources first
  for (const source of sources) {
    try {
      const response = await fetchWithTimeout(source.url);
      if (response.ok && response.headers.get('content-type')?.startsWith('image/')) {
        const buffer = Buffer.from(await response.arrayBuffer());
        if (buffer.length > 100) { // Valid image should be > 100 bytes
          await saveLogos(ticker, buffer);
          console.log(`✅ ${ticker}: Success from ${source.name}`);
          return { ticker, success: true, source: source.name };
        }
      }
    } catch (error) {
      console.log(`❌ ${ticker}: ${source.name} failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  // Try Simple Icons SVG
  try {
    const slug = domain.split('.')[0].toLowerCase();
    const icon = Object.values(si).find((i: any) => 
      i && typeof i === 'object' && 'slug' in i && (
        i.slug === slug || 
        i.slug === ticker.toLowerCase() ||
        i.title.toLowerCase().includes(slug)
      )
    ) as any;
    
    if (icon) {
      // Convert SVG to PNG using Sharp
      const svgBuffer = Buffer.from(icon.svg);
      const buffer = await sharp(svgBuffer)
        .resize(128, 128)
        .png()
        .toBuffer();
      
      await saveLogos(ticker, buffer);
      console.log(`✅ ${ticker}: Success from simple-icons (${icon.title})`);
      return { ticker, success: true, source: 'simple-icons' };
    }
  } catch (error) {
    console.log(`❌ ${ticker}: simple-icons failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  // Fallback to UI Avatars
  try {
    const fallbackUrl = `https://ui-avatars.com/api/?name=${ticker}&background=0066CC&color=fff&size=128&font-size=0.4&bold=true&format=png`;
    const response = await fetchWithTimeout(fallbackUrl);
    
    if (response.ok) {
      const buffer = Buffer.from(await response.arrayBuffer());
      await saveLogos(ticker, buffer);
      console.log(`✅ ${ticker}: Success from ui-avatars (fallback)`);
      return { ticker, success: true, source: 'ui-avatars' };
    }
  } catch (error) {
    console.log(`❌ ${ticker}: ui-avatars failed - ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return { 
    ticker, 
    success: false, 
    source: 'ui-avatars',
    error: 'All sources failed' 
  };
}

async function saveLogos(ticker: string, sourceBuffer: Buffer) {
  const sizes = [32, 64];
  
  await Promise.all(
    sizes.map(async (size) => {
      const filename = `${ticker.toLowerCase()}-${size}.webp`;
      const filepath = path.join(LOGOS_DIR, filename);
      
      await sharp(sourceBuffer)
        .resize(size, size, { fit: 'contain', background: { r: 255, g: 255, b: 255, alpha: 0 } })
        .webp({ quality: 90 })
        .toFile(filepath);
    })
  );
}

async function processBatch(batch: [string, string][]): Promise<LogoFetchResult[]> {
  return Promise.all(
    batch.map(([ticker, domain]) => fetchLogo(ticker, domain))
  );
}

async function main() {
  console.log('🚀 Starting logo crawler...');
  
  // Ensure logos directory exists
  await ensureDir(LOGOS_DIR);
  
  const entries = Object.entries(TICKER_DOMAINS);
  const totalCount = entries.length;
  
  console.log(`📊 Processing ${totalCount} tickers in batches of ${BATCH_SIZE}`);
  
  const results: LogoFetchResult[] = [];
  
  // Process in batches to avoid overwhelming external APIs
  for (let i = 0; i < entries.length; i += BATCH_SIZE) {
    const batch = entries.slice(i, i + BATCH_SIZE);
    const batchNumber = Math.floor(i / BATCH_SIZE) + 1;
    const totalBatches = Math.ceil(entries.length / BATCH_SIZE);
    
    console.log(`\n📦 Processing batch ${batchNumber}/${totalBatches}`);
    
    const batchResults = await processBatch(batch);
    results.push(...batchResults);
    
    // Rate limiting - wait between batches
    if (i + BATCH_SIZE < entries.length) {
      console.log('⏳ Waiting 1s before next batch...');
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  // Summary
  const successful = results.filter(r => r.success).length;
  const failed = results.filter(r => !r.success).length;
  
  const sourceStats = results.reduce((acc, r) => {
    if (r.success) {
      acc[r.source] = (acc[r.source] || 0) + 1;
    }
    return acc;
  }, {} as Record<string, number>);
  
  console.log('\n📊 SUMMARY:');
  console.log(`✅ Successful: ${successful}/${totalCount} (${Math.round(successful/totalCount*100)}%)`);
  console.log(`❌ Failed: ${failed}/${totalCount} (${Math.round(failed/totalCount*100)}%)`);
  console.log('\n📈 Source breakdown:');
  Object.entries(sourceStats).forEach(([source, count]) => {
    console.log(`  ${source}: ${count} logos`);
  });
  
  if (failed > 0) {
    console.log('\n❌ Failed tickers:');
    results.filter(r => !r.success).forEach(r => {
      console.log(`  ${r.ticker}: ${r.error}`);
    });
  }
  
  console.log('\n🎉 Logo crawler completed!');
  console.log(`📁 Logos saved to: ${LOGOS_DIR}`);
}

// Run the script
if (require.main === module) {
  main().catch(console.error);
}

export { main as fetchLogos };