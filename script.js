// === DOWNLOAD PDF & WORD - RESUME PEMERIKSAAN SAFETY LIFT ===

// Gunakan html2pdf untuk PDF dan docx untuk Word

async function downloadPDF(itemId) {
    const item = allData.find(d => d.__backendId === itemId);
    if (!item) return;

    // Parsing data aman
    let itemsData = [];
    let workData = [];
    try {
        itemsData = typeof item.items === 'string' ? JSON.parse(item.items) : item.items || [];
    } catch { itemsData = []; }
    try {
        workData = typeof item.additional_work === 'string' ? JSON.parse(item.additional_work) : item.additional_work || [];
    } catch { workData = []; }

    // === HEADER SIGMA + RESUME ===
    let htmlContent = `
    <div style="font-family: Arial; padding: 20px;">
        <h2 style="text-align:center; margin-bottom:0;">Safety Check (LES – Lift & Escalator Service)</h2>
        <h3 style="text-align:center; margin-top:4px;">PT. JAYA KENCANA - SIGMA</h3>
        <hr style="border:1px solid #000; margin:15px 0;">
        <h2 style="text-align:center;">Resume Pemeriksaan Safety Lift</h2>

        <p>Berikut kami sampaikan rekomendasi spare part dan pekerjaan lainnya dari pemeriksaan safety lift di:</p>

        <table width="100%" style="margin-bottom:10px;">
            <tr><td><strong>Nama Proyek:</strong> ${item.building_name || '-'}</td><td><strong>Checker:</strong> ${item.technician || '-'}</td></tr>
            <tr><td><strong>Tanggal:</strong> ${item.date || '-'}</td><td></td></tr>
            <tr><td><strong>Unit:</strong> ${item.unit || '-'}</td><td><strong>Mfg:</strong> ${item.mfg || '-'}</td></tr>
            <tr><td><strong>Tipe:</strong> ${item.type || '-'}</td><td></td></tr>
        </table>

        <h3>Item Spare Part</h3>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
            <thead style="background:#f0f0f0;">
                <tr>
                    <th>No</th><th>Item Spare Part</th><th>Kondisi</th><th>Jumlah</th>
                    <th>Satuan</th><th>Remarks</th><th>Prioritas</th>
                </tr>
            </thead>
            <tbody>`;

    itemsData.forEach((it, idx) => {
        htmlContent += `
            <tr>
                <td>${idx + 1}</td>
                <td>${it.sparepart || '-'}</td>
                <td>${it.condition || '-'}</td>
                <td>${it.quantity || '-'}</td>
                <td>${it.unit_type || '-'}</td>
                <td>${it.remarks || '-'}</td>
                <td>${it.priority || '-'}</td>
            </tr>`;
    });

    htmlContent += `</tbody></table>`;

    // === PEKERJAAN LAINNYA ===
    htmlContent += `
        <h3 style="margin-top:20px;">Pekerjaan Lainnya</h3>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
            <thead style="background:#f0f0f0;">
                <tr>
                    <th>No</th><th>Pekerjaan Lainnya</th><th>Kondisi</th>
                    <th>Keterangan</th><th>Remarks</th><th>Prioritas</th>
                </tr>
            </thead>
            <tbody>`;

    workData.forEach((w, idx) => {
        htmlContent += `
            <tr>
                <td>${idx + 1}</td>
                <td>${w.additional_work || '-'}</td>
                <td>${w.work_condition || '-'}</td>
                <td>${w.description || '-'}</td>
                <td>${w.work_remarks || '-'}</td>
                <td>${w.work_priority || '-'}</td>
            </tr>`;
    });

    htmlContent += `</tbody></table>`;

    // === FOTO SPAREPART ===
    htmlContent += `
        <h3 style="margin-top:25px;">Foto-foto Temuan Pemeriksaan Safety Lift (Item Spare Part)</h3>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
            <thead><tr><th>No</th><th>Temuan Safety</th><th>Keterangan</th></tr></thead><tbody>`;

    itemsData.forEach((it, idx) => {
        const photos = Array.isArray(it.photos) ? it.photos : [];
        htmlContent += `<tr><td>${idx + 1}</td><td>${it.sparepart || '-'}</td><td>${it.remarks || '-'}</td></tr>`;
        if (photos.length > 0) {
            htmlContent += `<tr><td colspan="3" style="text-align:center;">`;
            photos.forEach(ph => {
                if (ph.data && ph.data.startsWith("data:image")) {
                    htmlContent += `<img src="${ph.data}" width="180" style="margin:5px;border-radius:8px;"/>`;
                }
            });
            htmlContent += `</td></tr>`;
        }
    });

    htmlContent += `</tbody></table>`;

    // === FOTO PEKERJAAN ===
    htmlContent += `
        <h3 style="margin-top:25px;">Foto-foto Pemeriksaan Safety Lift (Pekerjaan Lainnya)</h3>
        <table border="1" cellspacing="0" cellpadding="5" width="100%">
            <thead><tr><th>No</th><th>Temuan Safety</th><th>Keterangan</th></tr></thead><tbody>`;

    workData.forEach((w, idx) => {
        const photos = Array.isArray(w.photos) ? w.photos : [];
        htmlContent += `<tr><td>${idx + 1}</td><td>${w.additional_work || '-'}</td><td>${w.work_remarks || '-'}</td></tr>`;
        if (photos.length > 0) {
            htmlContent += `<tr><td colspan="3" style="text-align:center;">`;
            photos.forEach(ph => {
                if (ph.data && ph.data.startsWith("data:image")) {
                    htmlContent += `<img src="${ph.data}" width="180" style="margin:5px;border-radius:8px;"/>`;
                }
            });
            htmlContent += `</td></tr>`;
        }
    });

    htmlContent += `</tbody></table>`;

    // === CATATAN DAN FOOTER ===
    htmlContent += `
        <p style="margin-top:20px;"><strong>Catatan:</strong><br>
        Prioritas 1: 0-3 bulan / Urgent<br>
        Prioritas 2: 3-6 bulan<br>
        Prioritas 3: 6-12 bulan / Cadangan
        </p>
        <p style="text-align:right;">Safety Check (LES – Lift & Escalator Service)<br>PT. Jaya Kencana</p>
    </div>`;

    const opt = {
        margin: 0.3,
        filename: `${item.building_name || 'Resume'} - Resume - ${item.unit || 'Unit'}.pdf`,
        image: { type: 'jpeg', quality: 0.98 },
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'in', format: 'a4', orientation: 'portrait' }
    };

    html2pdf().set(opt).from(htmlContent).save();
}


// === DOWNLOAD WORD ===
async function downloadWord(itemId) {
    const item = allData.find(d => d.__backendId === itemId);
    if (!item) return;

    let itemsData = [];
    let workData = [];
    try {
        itemsData = typeof item.items === 'string' ? JSON.parse(item.items) : item.items || [];
    } catch { itemsData = []; }
    try {
        workData = typeof item.additional_work === 'string' ? JSON.parse(item.additional_work) : item.additional_work || [];
    } catch { workData = []; }

    let html = `
    <h2 style="text-align:center;">Safety Check (LES – Lift & Escalator Service)</h2>
    <h3 style="text-align:center;">PT. JAYA KENCANA - SIGMA</h3>
    <hr><h2 style="text-align:center;">Resume Pemeriksaan Safety Lift</h2>
    <p>Nama Proyek: ${item.building_name}<br>Checker: ${item.technician}<br>
    Tanggal: ${item.date}<br>Unit: ${item.unit || '-'} | Mfg: ${item.mfg || '-'} | Tipe: ${item.type || '-'}</p>

    <h3>Item Spare Part</h3>
    <table border="1" width="100%" cellspacing="0" cellpadding="5">
    <tr><th>No</th><th>Item Spare Part</th><th>Kondisi</th><th>Jumlah</th><th>Satuan</th><th>Remarks</th><th>Prioritas</th></tr>`;
    
    itemsData.forEach((it, i) => {
        html += `<tr><td>${i+1}</td><td>${it.sparepart||'-'}</td><td>${it.condition||'-'}</td><td>${it.quantity||'-'}</td>
        <td>${it.unit_type||'-'}</td><td>${it.remarks||'-'}</td><td>${it.priority||'-'}</td></tr>`;
    });
    html += `</table>

    <h3>Pekerjaan Lainnya</h3>
    <table border="1" width="100%" cellspacing="0" cellpadding="5">
    <tr><th>No</th><th>Pekerjaan</th><th>Kondisi</th><th>Keterangan</th><th>Remarks</th><th>Prioritas</th></tr>`;
    workData.forEach((w,i)=>{
        html += `<tr><td>${i+1}</td><td>${w.additional_work||'-'}</td><td>${w.work_condition||'-'}</td>
        <td>${w.description||'-'}</td><td>${w.work_remarks||'-'}</td><td>${w.work_priority||'-'}</td></tr>`;
    });
    html += `</table>

    <h3>Foto-foto Temuan Pemeriksaan Safety Lift (Item Spare Part)</h3>`;
    itemsData.forEach((it, idx)=>{
        const photos = Array.isArray(it.photos)?it.photos:[];
        html += `<p><strong>${idx+1}. ${it.sparepart||'-'}</strong><br>${it.remarks||'-'}</p>`;
        photos.forEach(ph=>{
            if(ph.data && ph.data.startsWith('data:image')){
                html += `<img src="${ph.data}" width="200"><br>`;
            }
        });
    });

    html += `<h3>Foto-foto Pemeriksaan Safety Lift (Pekerjaan Lainnya)</h3>`;
    workData.forEach((w, idx)=>{
        const photos = Array.isArray(w.photos)?w.photos:[];
        html += `<p><strong>${idx+1}. ${w.additional_work||'-'}</strong><br>${w.work_remarks||'-'}</p>`;
        photos.forEach(ph=>{
            if(ph.data && ph.data.startsWith('data:image')){
                html += `<img src="${ph.data}" width="200"><br>`;
            }
        });
    });

    html += `<p><strong>Catatan:</strong><br>Prioritas 1: 0-3 bulan / Urgent<br>Prioritas 2: 3-6 bulan<br>Prioritas 3: 6-12 bulan / Cadangan</p>`;

    const converted = htmlToDocx(html, `${item.building_name || 'Resume'} - Resume - ${item.unit || 'Unit'}.docx`);
}
