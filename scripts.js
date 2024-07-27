document.getElementById('document-form').addEventListener('submit', function (event) {
    event.preventDefault();
    console.log('Form submitted');

    const formData = new FormData(this);

    fetch('http://localhost:3000/documents', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('Server response:', data);
        if (data.error) {
            alert('Error: ' + data.error);
        } else {
            alert('Document submitted successfully');
            loadAndDisplayDocuments();
        }
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

function loadAndDisplayDocuments() {
    console.log('Loading documents');
    fetch('http://localhost:3000/documents')
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(documents => {
        console.log('Documents received:', documents);
        if (documents.length === 0) {
            console.log('No documents received');
            return;
        }
        const tbody = document.querySelector('#document-table tbody');
        if (!tbody) {
            console.error('Table body not found');
            return;
        }
        tbody.innerHTML = '';
        documents.forEach(doc => {
            console.log('Processing document:', doc);
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${doc.serialNumber || ''}</td>
                <td>${doc.referenceID || ''}</td>
                <td>${doc.dateOfDocument || ''}</td>
                <td>${doc.timeOfDocument || ''}</td>
                <td>${doc.subject || ''}</td>
                <td>${doc.fromEntity || ''}</td>
                <td>${doc.pdfPath ? '<a href="' + doc.pdfPath + '" target="_blank">View PDF</a>' : 'No PDF'}</td>
                <td>${typeof doc.actions === 'string' ? doc.actions : JSON.stringify(doc.actions)}</td>
                <td>${doc.deadlineDate || ''} ${doc.deadlineTime || ''}</td>
            `;
            tbody.appendChild(tr);
        });
        console.log('Table updated');
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

// Call this function when the page loads to display any existing documents
loadAndDisplayDocuments();

function loadDocuments() {
    fetch('http://localhost:3000/documents')
    .then(response => response.json())
    .then(data => {
        const tbody = document.querySelector('#document-table tbody');
        tbody.innerHTML = '';
        data.forEach(doc => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td>${doc.serialNumber}</td>
                <td>${doc.referenceID}</td>
                <td>${new Date(doc.dateOfDocument).toLocaleDateString()}</td>
                <td>${doc.timeOfDocument}</td>
                <td>${doc.subject}</td>
                <td>${doc.fromEntity}</td>
                <td><a href="${doc.pdfPath}" target="_blank">View PDF</a></td>
                <td>
                    ${doc.actions.map(action => `
                        <div>
                            <p>${action.actionName} (Deadline: ${new Date(action.deadline).toLocaleDateString()} ${action.deadlineTime}, Pending: ${new Date(action.pendingDate).toLocaleDateString()})</p>
                            ${action.actionPdfPath ? `<a href="${action.actionPdfPath}" target="_blank">View Action PDF</a>` : ''}
                        </div>
                    `).join('')}
                </td>
                <td>${getReminder(doc.actions)}</td>
            `;
            tbody.appendChild(tr);
        });
    })
    .catch(error => {
        console.error('Error:', error);
    });
}

function getReminder(actions) {
    const now = new Date();
    const reminders = actions.map(action => {
        const deadlineDateTime = new Date(`${action.deadline}T${action.deadlineTime}`);
        const timeDiff = deadlineDateTime - now;
        const daysRemaining = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
        if (daysRemaining <= 10) {
            return `<span class="reminder">${daysRemaining} days remaining</span>`;
        }
        return '';
    });
    return reminders.filter(reminder => reminder).join('<br>');
}

loadDocuments();
app.post('/documents', upload.fields([{ name: 'pdf', maxCount: 1 }, { name: 'actionPdf', maxCount: 1 }]), (req, res) => {
    const newDoc = req.body;
    newDoc.serialNumber = documents.length + 1;
    
    if (req.files.pdf) {
        newDoc.pdfPath = req.files.pdf[0].path;
    }
    if (req.files.actionPdf) {
        newDoc.actionPdfPath = req.files.actionPdf[0].path;
    }
    
    documents.push(newDoc);
    console.log('Documents after adding:', documents); // Add this line
    res.json({ message: 'Document added successfully', document: newDoc });
});
app.get('/documents', (req, res) => {
    console.log('Sending documents:', documents);
    res.json(documents);
});