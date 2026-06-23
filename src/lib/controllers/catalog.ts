export type ControllerManufacturerId =
  | "hunter"
  | "rainbird"
  | "orbit"
  | "hydrorain"
  | "rachio";

export type ControllerModel = {
  id: string;
  manufacturerId: ControllerManufacturerId;
  name: string;
  manualTitle: string;
  manualUrl: string;
};

export const CONTROLLER_MANUFACTURERS: {
  id: ControllerManufacturerId;
  label: string;
}[] = [
  { id: "hunter", label: "Hunter" },
  { id: "rainbird", label: "Rain Bird" },
  { id: "orbit", label: "Orbit / B-hyve" },
  { id: "hydrorain", label: "Hydro-Rain" },
  { id: "rachio", label: "Rachio" },
];

export const CONTROLLER_MODELS: ControllerModel[] = [
  // Hunter
  {
    id: "hunter-eco-logic",
    manufacturerId: "hunter",
    name: "Eco-Logic",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/IC_EcoLogic_EM.pdf",
  },
  {
    id: "hunter-x-core",
    manufacturerId: "hunter",
    name: "X-Core / XC",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_XCORE_EM.pdf",
  },
  {
    id: "hunter-x2",
    manufacturerId: "hunter",
    name: "X2",
    manualTitle: "Quick Programming Guide",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/rc-103-qg-x2-quickguide-intl-print.pdf",
  },
  {
    id: "hunter-pro-c",
    manufacturerId: "hunter",
    name: "Pro-C / PCC",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/om_proc_dom.pdf",
  },
  {
    id: "hunter-pro-c-older",
    manufacturerId: "hunter",
    name: "Older Pro-C / PCC",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_PROCC_em.pdf",
  },
  {
    id: "hunter-p2c",
    manufacturerId: "hunter",
    name: "P2C",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/2023-07/om-p2c-en.pdf",
  },
  {
    id: "hunter-hydrawise",
    manufacturerId: "hunter",
    name: "HC / Pro-HC / HPC / HCC Hydrawise",
    manualTitle: "Installation Guide",
    manualUrl:
      "https://www.hunterindustries.com/sites/default/files/rc-092-ig-hydrawisecontroller-web.pdf",
  },
  {
    id: "hunter-hcc",
    manufacturerId: "hunter",
    name: "HCC",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/2024-02/RC-081-RevC-QG-HCC-Multi-web.pdf",
  },
  {
    id: "hunter-icc",
    manufacturerId: "hunter",
    name: "ICC",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_ICC_DOM.pdf",
  },
  {
    id: "hunter-icc2",
    manufacturerId: "hunter",
    name: "ICC2",
    manualTitle: "Owner's Manual",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/2025-02/RC-225-OM-ICC2Flow-US.pdf",
  },
  {
    id: "hunter-mcc",
    manufacturerId: "hunter",
    name: "MCC",
    manualTitle: "Owner's Manual",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/2026-04/RC-232-OM-MCC-US-Web.pdf",
  },
  {
    id: "hunter-i-core",
    manufacturerId: "hunter",
    name: "I-Core",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_ICORE_Dom.pdf",
  },
  {
    id: "hunter-dual",
    manufacturerId: "hunter",
    name: "DUAL / DUAL48M Decoder Module",
    manualTitle: "Owner's Manual",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/lit-533_reva_om_dual_web.pdf",
  },
  {
    id: "hunter-acc",
    manufacturerId: "hunter",
    name: "ACC",
    manualTitle: "Owner's Manual",
    manualUrl:
      "https://www.hunterindustries.com/sites/default/files/acc_om/OM_ACC_Dom_21_Run_Time.pdf",
  },
  {
    id: "hunter-acc2",
    manufacturerId: "hunter",
    name: "ACC2 Decoder",
    manualTitle: "Owner's Manual",
    manualUrl:
      "https://www.hunterindustries.com/sites/default/files/2024-07/RC-035-RevA-OM-ACC2-Decoder-EM-web.pdf",
  },
  {
    id: "hunter-btt2",
    manufacturerId: "hunter",
    name: "BTT / BTT2",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/2025-01/RC-074-RevG-BTT2-QG-EN-web.pdf",
  },
  {
    id: "hunter-node",
    manufacturerId: "hunter",
    name: "NODE",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_NODE_dom.pdf",
  },
  {
    id: "hunter-node-bt",
    manufacturerId: "hunter",
    name: "NODE-BT",
    manualTitle: "Quick Start Guide",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/rc-108-qg-node-bt.pdf",
  },
  {
    id: "hunter-icd-hp",
    manufacturerId: "hunter",
    name: "ICD-HP Programmer",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_ICDHP_em.pdf",
  },
  {
    id: "hunter-wvp",
    manufacturerId: "hunter",
    name: "WVP / WVC",
    manualTitle: "Owner's Manual",
    manualUrl: "https://www.hunterirrigation.com/sites/default/files/OM_WVP_DOM.pdf",
  },
  {
    id: "hunter-wvl",
    manufacturerId: "hunter",
    name: "WVL Wireless Valve Link",
    manualTitle: "Owner's Manual",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/2024-08/RC-184-OM-WVL-EN-web.pdf",
  },
  {
    id: "hunter-ez-decoder",
    manufacturerId: "hunter",
    name: "EZ Decoder System",
    manualTitle: "Installation Guide",
    manualUrl:
      "https://www.hunterirrigation.com/sites/default/files/rc-101-ezdm-decoder-ig-us-web.pdf",
  },

  // Rain Bird
  {
    id: "rainbird-rc2-arc8",
    manufacturerId: "rainbird",
    name: "RC2 / ARC8 WiFi Smart Controller",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2022-11/640372-01_04no22_manual_14l_rc2-arc8-web.pdf",
  },
  {
    id: "rainbird-esp-tm2",
    manufacturerId: "rainbird",
    name: "ESP-TM2",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2017-06/man_ESP-TM2_en.pdf",
  },
  {
    id: "rainbird-esp-me3",
    manufacturerId: "rainbird",
    name: "ESP-ME3",
    manualTitle: "Advanced User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2020-03/d41274_15ja20_esp-me3-user-manual-advanced-dom_en-en.pdf",
  },
  {
    id: "rainbird-esp-me",
    manufacturerId: "rainbird",
    name: "ESP-Me",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-02/man_ESP-Me-WiFi-Compatible_en.pdf",
  },
  {
    id: "rainbird-esp-rzxe",
    manufacturerId: "rainbird",
    name: "ESP-RZXe",
    manualTitle: "Advanced User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-12/ESP-RZXe-AdvancedUserManual_EN.pdf",
  },
  {
    id: "rainbird-esp-2wire",
    manufacturerId: "rainbird",
    name: "ESP-2WIRE",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2024-04/d42228_esp-2wire_user-manual_advanced_en-en_0.pdf",
  },
  {
    id: "rainbird-esp-9v",
    manufacturerId: "rainbird",
    name: "ESP-9V",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-02/man_ESP-9V.pdf",
  },
  {
    id: "rainbird-esp-bat-bt",
    manufacturerId: "rainbird",
    name: "ESP-BAT-BT",
    manualTitle: "Support Page",
    manualUrl: "https://www.rainbird.com/products/esp-bat-bt/support",
  },
  {
    id: "rainbird-esp-lxme",
    manufacturerId: "rainbird",
    name: "ESP-LXME",
    manualTitle: "Installation & Operation Guide",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-02/man_ESP-LXME-Installation-Operation-Guide_en.pdf",
  },
  {
    id: "rainbird-esp-lxme2",
    manufacturerId: "rainbird",
    name: "ESP-LXME2 / LXME2 Pro",
    manualTitle: "Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2022-02/lxme2manual01_21_2022_2.pdf",
  },
  {
    id: "rainbird-esp-lxd",
    manufacturerId: "rainbird",
    name: "ESP-LXD",
    manualTitle: "Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2023-02/man_esp-lxd_en_sd211_update_feb_2023.pdf",
  },
  {
    id: "rainbird-esp-lxivm",
    manufacturerId: "rainbird",
    name: "ESP-LXIVM",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2020-07/d41612_08jl20_lx-ivm_user_manual_en-en_200710-01.pdf",
  },
  {
    id: "rainbird-st8-wifi",
    manufacturerId: "rainbird",
    name: "ST8-WiFi",
    manualTitle: "Timer Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2017-06/man_ST8-WiFi.pdf",
  },
  {
    id: "rainbird-sst",
    manufacturerId: "rainbird",
    name: "SST / Simple-to-Set",
    manualTitle: "Operation Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2017-06/man_SSTsmart-Operation.pdf",
  },
  {
    id: "rainbird-esp-legacy",
    manufacturerId: "rainbird",
    name: "ESP Legacy Series",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-02/man_ESP.pdf",
  },
  {
    id: "rainbird-esp-tm-legacy",
    manufacturerId: "rainbird",
    name: "ESP-TM Legacy",
    manualTitle: "User Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-02/man_ESP-TM.pdf",
  },
  {
    id: "rainbird-ism",
    manufacturerId: "rainbird",
    name: "ISM",
    manualTitle: "Instruction Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2017-06/man_ISMseries.pdf",
  },
  {
    id: "rainbird-isa",
    manufacturerId: "rainbird",
    name: "ISA 300 / ISA 400",
    manualTitle: "ISA Series Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2017-06/man_ISAseries.pdf",
  },
  {
    id: "rainbird-ec",
    manufacturerId: "rainbird",
    name: "Ec Series",
    manualTitle: "Controller Manual",
    manualUrl: "https://www.rainbird.com/media/4246",
  },
  {
    id: "rainbird-e-class",
    manufacturerId: "rainbird",
    name: "E-Class",
    manualTitle: "Manual",
    manualUrl: "https://www.rainbird.com/media/1333",
  },
  {
    id: "rainbird-tbos-bt",
    manufacturerId: "rainbird",
    name: "TBOS-BT",
    manualTitle: "Control Module Manual",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2021-09/9-23-revs_tbos-bt-manual-2021_0786.pdf",
  },
  {
    id: "rainbird-tbos-ii",
    manufacturerId: "rainbird",
    name: "TBOS-II",
    manualTitle: "Field Transmitter Quick Reference Guide",
    manualUrl:
      "https://www.rainbird.com/sites/default/files/media/documents/2018-02/man_TBOS-II-FieldTransmitterQRG.pdf",
  },

  // Orbit / B-hyve
  {
    id: "orbit-bhyve-smart-wifi",
    manufacturerId: "orbit",
    name: "B-hyve Smart WiFi Timer (57946 / 57950 / 04080 / 04082)",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/57946-24_rC_11.pdf?v=1706284441",
  },
  {
    id: "orbit-bhyve-indoor",
    manufacturerId: "orbit",
    name: "B-hyve Indoor Controller (57915 / 57925 / 04060)",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/B-hyve_Indoor_Controller_Quick_Start_Guide.pdf?v=1679593310",
  },
  {
    id: "orbit-bhyve-xr",
    manufacturerId: "orbit",
    name: "B-hyve XR (57985 / 57995)",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/B-hyve_XR_Manual.pdf?v=1679593303",
  },
  {
    id: "orbit-bhyve-ht25",
    manufacturerId: "orbit",
    name: "B-hyve HT25 Hose Faucet Timer (21005 / 04138)",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/HT25_Quick_Start_Guide.pdf?v=1679593302",
  },
  {
    id: "orbit-bhyve-hub",
    manufacturerId: "orbit",
    name: "B-hyve Wi-Fi Hub (21006)",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/21006-50_rB_1_1.pdf?v=1702663461",
  },
  {
    id: "orbit-bhyve-xd",
    manufacturerId: "orbit",
    name: "B-hyve XD Hose Timers (24511 / 24632 / 24634)",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/B-hyve_XD_Quick_Start_Guide.pdf?v=1679593303",
  },
  {
    id: "orbit-bhyve-21027",
    manufacturerId: "orbit",
    name: "B-hyve 21027",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/21027-24_rA_11.pdf?v=1702663460",
  },
  {
    id: "orbit-57894",
    manufacturerId: "orbit",
    name: "Orbit 57894 / 57896",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/57894-24_rF_41.pdf?v=1679593353",
  },
  {
    id: "orbit-28568",
    manufacturerId: "orbit",
    name: "Orbit 28568",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/28566-50_rB_31.pdf?v=1702663155",
  },
  {
    id: "orbit-easy-dial",
    manufacturerId: "orbit",
    name: "Orbit Easy Dial 57594",
    manualTitle: "User Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/Easy_Dial_User_Manual_57594-24.pdf?v=1776872267",
  },
  {
    id: "orbit-57004",
    manufacturerId: "orbit",
    name: "Orbit 57004 / 57006 / 91024 / 94002 / 94004",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/Product_Manual_57004.pdf?v=1707852622",
  },
  {
    id: "orbit-57880",
    manufacturerId: "orbit",
    name: "Orbit 57880",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/57880-24_rD_1_1.pdf?v=1706284444",
  },
  {
    id: "orbit-57926",
    manufacturerId: "orbit",
    name: "Orbit 57926 / 57922 / ST2-RF Family",
    manualTitle: "Manual",
    manualUrl:
      "https://cdn.shopify.com/s/files/1/0489/2445/9176/files/91922.pdf?v=1702061615",
  },
  {
    id: "orbit-hose-timer-library",
    manufacturerId: "orbit",
    name: "Orbit Hose-End Timers",
    manualTitle: "Manual Library",
    manualUrl: "https://www.orbitonline.com/pages/orbit-hose-timer-manuals",
  },
  {
    id: "orbit-underground-library",
    manufacturerId: "orbit",
    name: "Orbit Underground Timers",
    manualTitle: "Manual Library",
    manualUrl: "https://www.orbitonline.com/pages/orbit-underground-timer-manuals",
  },
  {
    id: "orbit-bhyve-library",
    manufacturerId: "orbit",
    name: "B-hyve Product Manuals",
    manualTitle: "Manual Library",
    manualUrl: "https://www.orbitonline.com/pages/product-manuals-start-guides",
  },

  // Hydro-Rain
  {
    id: "hydrorain-hrc-100",
    manufacturerId: "hydrorain",
    name: "HRC 100",
    manualTitle: "Manual",
    manualUrl: "https://irrigationaudit.hydrorain.com/wp-content/uploads/2013/04/04054.pdf",
  },
  {
    id: "hydrorain-hrc-400",
    manufacturerId: "hydrorain",
    name: "HRC 400 WiFi",
    manualTitle: "Quick Start Guide",
    manualUrl: "https://hydrorain.com/wp-content/uploads/2021/01/HRC-400_Quick_Start_Guide.pdf",
  },
  {
    id: "hydrorain-hrc-900",
    manufacturerId: "hydrorain",
    name: "HRC 900 Battery Controller",
    manualTitle: "Manual",
    manualUrl: "https://hydrorain.com/wp-content/uploads/2021/09/HRC-900-Manual.pdf",
  },
  {
    id: "hydrorain-hrc-980",
    manufacturerId: "hydrorain",
    name: "HRC 980 Hose Faucet Timer",
    manualTitle: "Instruction Manual",
    manualUrl: "https://hydrorain.com/wp-content/uploads/2022/02/HRC-980-Instruction-manual.pdf",
  },
  {
    id: "hydrorain-library",
    manufacturerId: "hydrorain",
    name: "Hydro-Rain Manual Library",
    manualTitle: "Manual Library",
    manualUrl: "https://hydrorain.com/knowledgebase-tag/manual/",
  },

  // Rachio
  {
    id: "rachio-3",
    manufacturerId: "rachio",
    name: "Rachio 3 / 3e",
    manualTitle: "Installation Guide",
    manualUrl:
      "https://s3-us-west-2.amazonaws.com/rachio-support-media/Knowledge%2BBase/Rachio%2B3%2B/Rachio%2B3%2BSmart%2BSprinkler%2BController%2BInstallation%2BGuide.pdf",
  },
  {
    id: "rachio-gen2",
    manufacturerId: "rachio",
    name: "Rachio Gen 2",
    manualTitle: "Quick Start Guide",
    manualUrl:
      "https://rachio-support-media.s3.us-west-2.amazonaws.com/Knowledge%2BBase/Generation%2B2/RachioGeneration2-QuickStartGuide.pdf",
  },
  {
    id: "rachio-gen1",
    manufacturerId: "rachio",
    name: "Rachio Gen 1",
    manualTitle: "User Manual",
    manualUrl:
      "https://rainfallirrigation.com/wp-content/uploads/2020/08/Rachio-User-Manual.pdf",
  },
  {
    id: "rachio-hose-timer",
    manufacturerId: "rachio",
    name: "Rachio Smart Hose Timer",
    manualTitle: "Manual",
    manualUrl:
      "https://rachio-support-media.s3.us-west-2.amazonaws.com/Knowledge%2BBase/Smart%2BHose%2BTimer/hose-timer-manual.pdf",
  },
  {
    id: "rachio-library",
    manufacturerId: "rachio",
    name: "Rachio Manuals and Resources",
    manualTitle: "Manual Library",
    manualUrl: "https://support.rachio.com/en_us/rachio-manuals-and-resources-rkCSP81Yw",
  },
  {
    id: "rachio-user-guide",
    manufacturerId: "rachio",
    name: "Rachio User Guide",
    manualTitle: "Support Category",
    manualUrl: "https://support.rachio.com/en_us/categories/user-guide-HkrcWEadt",
  },
];

const modelById = new Map(CONTROLLER_MODELS.map((m) => [m.id, m]));

export function getControllerModel(modelId: string | null | undefined): ControllerModel | null {
  if (!modelId) return null;
  return modelById.get(modelId) ?? null;
}

export function getModelsForManufacturer(
  manufacturerId: ControllerManufacturerId
): ControllerModel[] {
  return CONTROLLER_MODELS.filter((m) => m.manufacturerId === manufacturerId);
}

export function getManufacturerLabel(manufacturerId: ControllerManufacturerId): string {
  return CONTROLLER_MANUFACTURERS.find((m) => m.id === manufacturerId)?.label ?? manufacturerId;
}

export function getControllerDisplayName(modelId: string | null | undefined): string | null {
  const model = getControllerModel(modelId);
  if (!model) return null;
  return `${getManufacturerLabel(model.manufacturerId)} ${model.name}`;
}
