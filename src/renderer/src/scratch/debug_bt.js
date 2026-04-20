const fs = require('fs');

function findMinorTypeInBluetoothData(data, targetName) {
  const root = data?.SPBluetoothDataType?.[0];
  if (!root) return undefined;

  const lists = [
    root.device_connected,
    root.device_not_connected,
    root.device_connected_v2,
    root.devices_list
  ];

  const targetLower = targetName.toLowerCase().trim();
  console.log(`Searching for: "${targetLower}"`);

  for (const list of lists) {
    if (!Array.isArray(list)) continue;
    for (const entry of list) {
       for (const [name, props] of Object.entries(entry)) {
         const p = props;
         const candidateName = (p.device_name || name).toLowerCase().trim();
         console.log(`Comparing with: "${candidateName}"`);
         
         if (candidateName === targetLower || candidateName.includes(targetLower) || targetLower.includes(candidateName)) {
           return p.device_minorType;
         }
       }
    }
  }
  return undefined;
}

const data = {
  "SPBluetoothDataType" : [
    {
      "device_connected" : [
        {
          "UGREEN HiTune Max5c" : {
            "device_address" : "0D:41:73:4E:B3:9A",
            "device_minorType" : "Headset"
          }
        }
      ]
    }
  ]
};

const result = findMinorTypeInBluetoothData(data, "UGREEN HiTune Max5c");
console.log(`Result: ${result}`);
