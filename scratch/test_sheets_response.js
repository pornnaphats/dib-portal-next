const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbzCWHyfyPUWQ6NlOlLRORY1s2bFu82RO3fbEp9RaRYgVDXaT82ZSph8FETLTmdM4PSqqw/exec';

async function testSheetsResponse() {
  const payload = {
    action: 'edit',
    id: 'RS430',
    name: 'มณฑิรา แพงทรัพย์',
    nameEn: 'Monthira Phaengsap',
    nickname: 'เมย์',
    email: 'monthira.p@realsmart.co.th',
    birthdate: '28/4/-',
    position: 'Junior',
    team: 'ETDA Call Center', // New team name!
    shift: '-',
    offdays: '-',
    status: 'active',
    empType: 'พนักงานประจำ'
  };

  console.log("Sending POST to Google Sheets...");
  const res = await fetch(WEB_APP_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'text/plain' },
    body: JSON.stringify(payload)
  });

  console.log("Status:", res.status);
  console.log("Headers:", Object.fromEntries(res.headers.entries()));
  const text = await res.text();
  console.log("Response text:", text);
}

testSheetsResponse();
