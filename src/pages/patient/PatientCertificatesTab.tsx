import React, { useState } from 'react';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { Modal } from "../../components/ui/modal";

interface Demographics {
  fullName?: string;
  myKadNo?: string;
  dob?: string;
  gender?: string;
  nationality?: string;
}

interface Certificate {
  _id: string;
  certType: string;
  certHash: string;
  ipfsCid?: string;
  issuedBy?: string;
  issuedAt?: string;
  transactionHash?: string;
  patient?: string;
}

interface Props {
  certs: Certificate[];
  loading: boolean;
  error: string | null;
}

const fetchDecryptedCertificate = async (patientAddress: string, certHash: string) => {

  const BACKEND_BASE_URL = 'https://medcertify-backend-production.up.railway.app';
  console.log('Calling fetchDecryptedCertificate', patientAddress, certHash);
  const response = await fetch(`${BACKEND_BASE_URL}/api/patients/${patientAddress}/certificates/${certHash}/`, {
    headers: { 'Authorization': `Bearer ${localStorage.getItem('jwt')}` }
  });
  if (!response.ok) throw new Error('Failed to fetch decrypted certificate');
  const result = await response.json();
  if (!result.success) throw new Error('Failed to decrypt certificate');
  return result.cert;
};

// Helper to mask IC
function maskIC(ic: string) {
  if (!ic || ic.length < 4) return ic;
  return ic.slice(0, 4) + '****' + ic.slice(-4);
}

// Helper to truncate long hashes
function truncateMiddle(str: string, frontLen = 8, backLen = 6) {
  if (!str || str.length <= frontLen + backLen + 3) return str;
  return str.slice(0, frontLen) + '...' + str.slice(-backLen);
}

const logoBase64 = undefined; // Optionally import your logo as base64 string here

// Helper to verify certificate and return full result
async function verifyCertificate(cert: Certificate) {
  try {
    const response = await fetch('/api/verify-certificate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ patientAddress: cert.patient, certHash: cert.certHash }),
    });
    if (!response.ok) return null;
    const result = await response.json();
    return result;
  } catch {
    return null;
  }
}

const PatientCertificatesTab: React.FC<Props & { demographics: Demographics | undefined }> = ({ certs, loading, error, demographics }) => {
  const [modalOpen, setModalOpen] = useState(false);
  const [pendingCert, setPendingCert] = useState<Certificate | null>(null);

  const handleDownloadClick = (cert: Certificate) => {
    setPendingCert(cert);
    setModalOpen(true);
  };

  const handleICChoice = async (showFullIC: boolean) => {
    setModalOpen(false);
    if (!pendingCert) return;
    await downloadCertificatePDF(pendingCert, demographics, showFullIC);
    setPendingCert(null);
  };

  const downloadCertificatePDF = async (cert: Certificate, demographics: Demographics | undefined, showFullIC: boolean) => {
    try {
      // Use cert.patient if available, otherwise show error
      const patientAddress = cert.patient;
      if (!patientAddress) {
        alert('Patient address not found for this certificate.');
        return;
      }
      if (!cert.certHash) {
        alert('Certificate hash not found for this certificate.');
        return;
      }
      const data = await fetchDecryptedCertificate(patientAddress, cert.certHash);
      const verificationResult = await verifyCertificate(cert);
      // Debug output
      if (verificationResult) {
        console.log('Certificate Verification Debug:', verificationResult);
      } else {
        console.log('Certificate Verification Debug: Verification failed or no response');
      }
      const isValid = verificationResult?.isValid;
      const doc = new jsPDF({ unit: 'pt', format: 'a4' });
      // Add sidebar
      doc.setFillColor(100, 100, 255, 0.08);
      doc.rect(0, 0, 60, 842, 'F');
      // Add watermark
      doc.setTextColor(220, 220, 255);
      doc.setFontSize(60);
      doc.text('MyClinic', 300, 500, { angle: 30, align: 'center' });
      // Add logo (optional)
      if (logoBase64) {
        doc.addImage(logoBase64, 'PNG', 70, 30, 80, 40);
      }
      // Header
      doc.setFillColor(100, 100, 255);
      doc.rect(60, 40, 475, 50, 'F');
      doc.setTextColor(255, 255, 255);
      doc.setFontSize(28);
      doc.text('e-Certificate', 297.5, 75, { align: 'center' });
      doc.setTextColor(0, 0, 0);
      let y = 110;
      // Certificate Info Table
      doc.setFontSize(13);
      const info = [
        ['Certificate Type', cert.certType || data.certType || '-'],
        ['Issued By', truncateMiddle((cert.issuedBy || data.issuedBy || ''))],
        ['Issued At', cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : (data.issuedAt ? new Date(data.issuedAt).toLocaleString() : '-')],
        ['Cert Hash', truncateMiddle((cert.certHash || data.certHash || ''))],
        ['IPFS CID', truncateMiddle(cert.ipfsCid || '')],
      ];
      info.forEach(([label, value]) => {
        doc.setFont('helvetica', 'bold');
        doc.text(`${label}:`, 80, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${value}`, 180, y);
        y += 22;
      });
      y += 10;
      // Patient Info
      if (demographics) {
        doc.setFontSize(15);
        doc.setTextColor(100, 100, 255);
        doc.text('Patient Information', 80, y); y += 4;
        doc.setDrawColor(100, 100, 255);
        doc.setLineWidth(1);
        doc.line(80, y, 220, y); y += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'bold');
        doc.text('Name:', 90, y);
        doc.setFont('helvetica', 'normal');
        doc.text(`${demographics.fullName || '-'}`, 180, y); y += 18;
        if (demographics.myKadNo) {
          doc.setFont('helvetica', 'bold');
          doc.text('IC Number:', 90, y);
          doc.setFont('helvetica', 'normal');
          doc.text(`${showFullIC ? demographics.myKadNo : maskIC(demographics.myKadNo)}`, 180, y); y += 18;
        }
        y += 10;
      }
      // Attestation
      if (data.attestation) {
        doc.setFontSize(15);
        doc.setTextColor(100, 100, 255);
        doc.text('Attestation', 80, y); y += 4;
        doc.setDrawColor(100, 100, 255);
        doc.setLineWidth(1);
        doc.line(80, y, 220, y); y += 10;
        doc.setFontSize(12);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        doc.text(typeof data.attestation === 'string' ? data.attestation : JSON.stringify(data.attestation), 90, y);
        y += 30;
      }
      // QR Code (Etherscan or contract URL)
      y += 10;
      const etherscanUrl = cert.transactionHash ? `https://sepolia.etherscan.io/tx/${cert.transactionHash}` : '';
      if (etherscanUrl && cert.transactionHash) {
        try {
          const qrDataUrl = await QRCode.toDataURL(etherscanUrl);
          doc.setFontSize(12);
          doc.setTextColor(80, 80, 80);
          doc.text('Scan to verify on blockchain:', 80, y); y += 4;
          doc.addImage(qrDataUrl, 'PNG', 80, y, 70, 70);
          y += 80;
        } catch (qrErr) {
          // Optionally handle QR code generation error
        }
      }
      // Add verification status to the PDF
      y += 10;
      doc.setFontSize(14);
      if (isValid) {
        doc.setTextColor(0, 150, 0);
        doc.text('Certificate Status: VALID ✅', 80, y);
      } else {
        doc.setTextColor(200, 0, 0);
        doc.text('Certificate Status: NOT VALID ❌', 80, y);
      }
      y += 24;
      doc.setTextColor(0, 0, 0); // Reset color
      // Footer
      doc.setFontSize(10);
      doc.setTextColor(150, 150, 150);
      doc.text('Generated by MyClinic Health System', 297.5, 820, { align: 'center' });
      // Save with a friendly filename
      const filename = `eCert_${cert.certType || 'Medical'}_${cert._id}.pdf`;
      doc.save(filename);
    } catch (err) {
      alert('Failed to generate PDF: ' + (err as Error).message);
    }
  };

  return (
    <div>
      <h3>Certificates</h3>
      <Modal isOpen={modalOpen} onClose={() => setModalOpen(false)} className="max-w-xs w-full" showCloseButton={true}>
        <div className="p-6 bg-white rounded-2xl shadow-2xl text-center">
          <h4 className="text-lg font-semibold mb-4 text-gray-800">Show full IC number on certificate?</h4>
          <div className="flex flex-col gap-2">
            <button
              className="bg-blue-600 text-white px-4 py-2 rounded font-semibold hover:bg-blue-700 transition-colors"
              onClick={() => handleICChoice(true)}
            >
              Show Full IC
            </button>
            <button
              className="bg-gray-200 text-gray-800 px-4 py-2 rounded font-semibold hover:bg-gray-300 transition-colors"
              onClick={() => handleICChoice(false)}
            >
              Mask IC
            </button>
          </div>
        </div>
      </Modal>
      {loading ? (
        <div>Loading...</div>
      ) : error ? (
        <div style={{ color: 'red' }}>{error}</div>
      ) : certs.length > 0 ? (
        <div>
          {/* Desktop Table */}
          <div className="hidden md:block w-full overflow-x-auto">
            <table className="min-w-full text-xs border mb-4">
              <thead className="bg-gray-100">
                <tr>
                  <th className="px-2 py-1">Type</th>
                  <th className="px-2 py-1">CID</th>
                  <th className="px-2 py-1">Issued By</th>
                  <th className="px-2 py-1">Issued At</th>
                  <th className="px-2 py-1">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(cert => (
                  <tr key={cert._id}>
                    <td className="px-2 py-1 border">{cert.certType || '-'}</td>
                    <td className="px-2 py-1 border break-all">{cert.ipfsCid || cert.certHash || '-'}</td>
                    <td className="px-2 py-1 border">{cert.issuedBy || '-'}</td>
                    <td className="px-2 py-1 border">{cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : '-'}</td>
                    <td className="px-2 py-1 border">
                      {cert.ipfsCid ? (
                        <>
                          <button
                            onClick={() => handleDownloadClick(cert)}
                            title="Download Certificate as PDF"
                            className="bg-blue-600 text-white px-3 py-1 rounded border border-blue-700 font-semibold shadow-sm mr-2 hover:bg-blue-700 transition-colors"
                            style={{ minWidth: 90 }}
                          >
                            Download
                          </button>
                        </>
                      ) : (
                        <span style={{ color: '#aaa' }}>No file</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {/* Mobile Cards */}
          <div className="block md:hidden space-y-3">
            {certs.map(cert => (
              <div key={cert._id} className="border rounded-lg p-3 bg-white shadow">
                <div className="font-semibold mb-1">{cert.certType || '-'}</div>
                <div className="text-xs text-gray-500 mb-1">CID: <span className="break-all">{truncateMiddle(cert.ipfsCid || cert.certHash || '-')}</span></div>
                <div className="text-xs mb-1">Issued By: {truncateMiddle(cert.issuedBy || '-')}</div>
                <div className="text-xs mb-1">Issued At: {cert.issuedAt ? new Date(cert.issuedAt).toLocaleString() : '-'}</div>
                <div className="mt-2">
                  {cert.ipfsCid ? (
                    <button
                      onClick={() => handleDownloadClick(cert)}
                      className="bg-blue-600 text-white px-3 py-1 rounded font-semibold shadow-sm hover:bg-blue-700 transition-colors w-full"
                    >
                      Download
                    </button>
                  ) : (
                    <span className="text-gray-400">No file</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div>No certificates found.</div>
      )}
    </div>
  );
};

export default PatientCertificatesTab; 