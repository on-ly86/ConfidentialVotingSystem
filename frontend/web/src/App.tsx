import React, { useState, useEffect } from "react";
import { 
  FaVoteYea, FaShieldAlt, FaLock, FaSearch, FaList, FaChartPie, 
  FaPlus, FaClock, FaBell, FaUserSecret, FaKey, FaDatabase, 
  FaEyeSlash, FaSpinner, FaTimes, FaCheck, FaClipboardList, FaUsers,
  FaRegCheckCircle, FaRegTimesCircle, FaBalanceScale, FaFileAlt
} from "react-icons/fa";
import WalletManager from "./components/WalletManager";
import WalletSelector from "./components/WalletSelector";
import { ethers } from "ethers";
import "./App.css";

// Mock data for demonstration
const MOCK_PROPOSALS = [
  {
    id: 1,
    title: "Board Member Election",
    description: "Elect new board members for the upcoming term",
    startTime: Date.now() - 86400000 * 2, // 2 days ago
    endTime: Date.now() + 86400000 * 5, // 5 days from now
    encryptedResults: {
      approve: "0x...encrypted...",
      reject: "0x...encrypted...",
      abstain: "0x...encrypted...",
      total: "0x...encrypted..."
    },
    thresholdAlert: false,
    isFinalized: false
  },
  {
    id: 2,
    title: "Merger Approval",
    description: "Approve acquisition of Tech Innovations Inc.",
    startTime: Date.now() - 86400000 * 1,
    endTime: Date.now() + 86400000 * 3,
    encryptedResults: {
      approve: "0x...encrypted...",
      reject: "0x...encrypted...",
      abstain: "0x...encrypted...",
      total: "0x...encrypted..."
    },
    thresholdAlert: true,
    isFinalized: false
  },
  {
    id: 3,
    title: "Executive Compensation Plan",
    description: "Approve new executive compensation structure",
    startTime: Date.now() - 86400000 * 4,
    endTime: Date.now() - 86400000 * 1,
    encryptedResults: {
      approve: "0x...encrypted...",
      reject: "0x...encrypted...",
      abstain: "0x...encrypted...",
      total: "0x...encrypted..."
    },
    thresholdAlert: false,
    isFinalized: true
  }
];

const MOCK_AUDIT_LOGS = [
  {
    id: 1,
    proposalId: 3,
    operation: "FINALIZE_RESULTS",
    operationHash: "0x9a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0",
    timestamp: Date.now() - 86400000 * 1,
    verified: true
  },
  {
    id: 2,
    proposalId: 2,
    operation: "THRESHOLD_ALERT",
    operationHash: "0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0",
    timestamp: Date.now() - 86400000 * 0.5,
    verified: true
  },
  {
    id: 3,
    proposalId: 1,
    operation: "VOTE_CAST",
    operationHash: "0x0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9",
    timestamp: Date.now() - 86400000 * 1.5,
    verified: false
  }
];

export default function App() {
  const [account, setAccount] = useState("");
  const [loading, setLoading] = useState(true);
  const [proposals, setProposals] = useState<any[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [creating, setCreating] = useState(false);
  const [walletSelectorOpen, setWalletSelectorOpen] = useState(false);
  const [provider, setProvider] = useState<ethers.BrowserProvider | null>(null);
  const [activeTab, setActiveTab] = useState("active");
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [selectedProposal, setSelectedProposal] = useState<any>(null);
  const [transactionStatus, setTransactionStatus] = useState<{
    visible: boolean;
    status: "pending" | "success" | "error";
    message: string;
  }>({ visible: false, status: "pending", message: "" });
  const [globalAlert, setGlobalAlert] = useState(false);

  useEffect(() => {
    // Simulate loading data from blockchain
    setTimeout(() => {
      setProposals(MOCK_PROPOSALS);
      setAuditLogs(MOCK_AUDIT_LOGS);
      setGlobalAlert(MOCK_PROPOSALS.some(p => p.thresholdAlert));
      setLoading(false);
    }, 1500);
  }, []);

  // Handle wallet selection
  const onWalletSelect = async (wallet: any) => {
    if (!wallet.provider) return;
    try {
      const web3Provider = new ethers.BrowserProvider(wallet.provider);
      setProvider(web3Provider);
      const accounts = await web3Provider.send("eth_requestAccounts", []);
      const acc = accounts[0] || "";
      setAccount(acc);

      wallet.provider.on("accountsChanged", async (accounts: string[]) => {
        const newAcc = accounts[0] || "";
        setAccount(newAcc);
      });
    } catch (e) {
      alert("Failed to connect wallet");
    }
  };

  const onConnect = () => setWalletSelectorOpen(true);
  const onDisconnect = () => {
    setAccount("");
    setProvider(null);
  };

  // Simulate creating a new proposal
  const createProposal = async (title: string, description: string, duration: number) => {
    if (!title || !description || duration <= 0) { 
      alert("Please fill all fields"); 
      return; 
    }
    if (!provider) { 
      alert("Please connect wallet first"); 
      return; 
    }
    
    setCreating(true);
    setTransactionStatus({
      visible: true,
      status: "pending",
      message: "Creating encrypted proposal..."
    });
    
    try {
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const newProposal = {
        id: proposals.length + 1,
        title,
        description,
        startTime: Date.now(),
        endTime: Date.now() + duration * 86400000,
        encryptedResults: {
          approve: "0x...encrypted...",
          reject: "0x...encrypted...",
          abstain: "0x...encrypted...",
          total: "0x...encrypted..."
        },
        thresholdAlert: false,
        isFinalized: false
      };
      
      setProposals([newProposal, ...proposals]);
      
      setTransactionStatus({
        visible: true,
        status: "success",
        message: "Proposal created successfully!"
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
        setShowCreateModal(false);
      }, 2000);
    } catch (e: any) {
      setTransactionStatus({
        visible: true,
        status: "error",
        message: "Creation failed: " + (e.message || "Unknown error")
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    } finally {
      setCreating(false);
    }
  };

  // Simulate casting a vote
  const castVote = async (proposalId: number, choice: string, weight: number) => {
    if (!provider) { 
      alert("Please connect wallet first"); 
      return; 
    }
    
    setCreating(true);
    setTransactionStatus({
      visible: true,
      status: "pending",
      message: "Encrypting and submitting vote..."
    });
    
    try {
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      setTransactionStatus({
        visible: true,
        status: "success",
        message: "Vote submitted successfully!"
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
        setShowVoteModal(false);
      }, 2000);
    } catch (e: any) {
      setTransactionStatus({
        visible: true,
        status: "error",
        message: "Vote failed: " + (e.message || "Unknown error")
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    } finally {
      setCreating(false);
    }
  };

  // Simulate finalizing a proposal
  const finalizeProposal = async (proposalId: number) => {
    if (!provider) { 
      alert("Please connect wallet first"); 
      return; 
    }
    
    setCreating(true);
    setTransactionStatus({
      visible: true,
      status: "pending",
      message: "Finalizing proposal results..."
    });
    
    try {
      // Simulate blockchain interaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Update proposal status
      const updatedProposals = proposals.map(p => 
        p.id === proposalId ? {...p, isFinalized: true} : p
      );
      setProposals(updatedProposals);
      
      // Add audit log
      const newLog = {
        id: auditLogs.length + 1,
        proposalId,
        operation: "FINALIZE_RESULTS",
        operationHash: `0x${Math.random().toString(16).substr(2, 40)}`,
        timestamp: Date.now(),
        verified: false
      };
      setAuditLogs([newLog, ...auditLogs]);
      
      setTransactionStatus({
        visible: true,
        status: "success",
        message: "Proposal finalized successfully!"
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 2000);
    } catch (e: any) {
      setTransactionStatus({
        visible: true,
        status: "error",
        message: "Finalization failed: " + (e.message || "Unknown error")
      });
      
      setTimeout(() => {
        setTransactionStatus({ visible: false, status: "pending", message: "" });
      }, 3000);
    } finally {
      setCreating(false);
    }
  };

  // Simulate verifying an audit log
  const verifyAuditLog = (logId: number) => {
    setAuditLogs(logs => 
      logs.map(log => 
        log.id === logId ? {...log, verified: true} : log
      )
    );
  };

  // Filter proposals based on active tab
  const filteredProposals = proposals.filter(proposal => {
    const now = Date.now();
    if (activeTab === "active") {
      return now >= proposal.startTime && now <= proposal.endTime && !proposal.isFinalized;
    } else if (activeTab === "upcoming") {
      return now < proposal.startTime;
    } else if (activeTab === "completed") {
      return now > proposal.endTime || proposal.isFinalized;
    }
    return true;
  });

  // Statistics
  const activeProposals = proposals.filter(p => 
    Date.now() >= p.startTime && Date.now() <= p.endTime && !p.isFinalized
  ).length;
  
  const completedProposals = proposals.filter(p => 
    Date.now() > p.endTime || p.isFinalized
  ).length;
  
  const votersCount = 42; // Mock value

  // Loading screen
  if (loading) return (
    <div className="loading-screen">
      <div className="spinner"></div>
      <p>Loading blockchain data...</p>
    </div>
  );

  return (
    <div className="app-container">
      {/* Privacy shield background */}
      <div className="privacy-shield-bg">
        <div className="shield-layer"></div>
        <div className="shield-layer"></div>
        <div className="shield-layer"></div>
      </div>
  
      {/* Navigation bar */}
      <header className="app-header">
        <div className="logo">
          <div className="logo-icon">
            <FaShieldAlt />
          </div>
          <h1>FHE<span>Govern</span></h1>
        </div>
        
        <div className="header-actions">
          {account && (
            <button 
              onClick={() => setShowCreateModal(true)} 
              className="create-proposal-btn"
            >
              <FaPlus /> New Proposal
            </button>
          )}
          <WalletManager account={account} onConnect={onConnect} onDisconnect={onDisconnect} />
        </div>
      </header>
  
      {/* Main content area */}
      <div className="main-content">
        {/* System introduction */}
        <section className="intro-section">
          <div className="intro-content">
            <div className="intro-text">
              <h2>Confidential Voting with Zama FHE</h2>
              <p>
                FHEGovern leverages cutting-edge Fully Homomorphic Encryption (FHE) technology to 
                ensure corporate voting remains confidential while maintaining auditability. 
                Unlike traditional systems, Zama FHE allows computations on encrypted data 
                without decryption, providing unprecedented privacy for sensitive governance decisions.
              </p>
              
              <div className="intro-features">
                <div className="feature">
                  <div className="feature-icon">
                    <FaKey />
                  </div>
                  <div>
                    <h3>FHE Encryption</h3>
                    <p>Votes encrypted before leaving voter's device</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <FaDatabase />
                  </div>
                  <div>
                    <h3>Encrypted Processing</h3>
                    <p>All vote counting happens on encrypted data</p>
                  </div>
                </div>
                
                <div className="feature">
                  <div className="feature-icon">
                    <FaEyeSlash />
                  </div>
                  <div>
                    <h3>Zero-Knowledge Auditing</h3>
                    <p>Verify results without revealing individual votes</p>
                  </div>
                </div>
              </div>
            </div>
            
            <div className="intro-image">
              <div className="privacy-shield">
                <FaShieldAlt />
              </div>
            </div>
          </div>
        </section>
        
        {/* Dashboard statistics */}
        <section className="dashboard-section">
          <div className="dashboard-stats">
            <div className="stat-card">
              <div className="stat-icon">
                <FaClipboardList />
              </div>
              <div className="stat-content">
                <h3>Active Proposals</h3>
                <p>{activeProposals}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaUsers />
              </div>
              <div className="stat-content">
                <h3>Registered Voters</h3>
                <p>{votersCount}</p>
              </div>
            </div>
            
            <div className="stat-card">
              <div className="stat-icon">
                <FaRegCheckCircle />
              </div>
              <div className="stat-content">
                <h3>Completed Votes</h3>
                <p>{completedProposals}</p>
              </div>
            </div>
            
            <div className={`stat-card ${globalAlert ? 'alert-active' : ''}`}>
              <div className="stat-icon">
                <FaBell />
              </div>
              <div className="stat-content">
                <h3>Threshold Alerts</h3>
                <p>{globalAlert ? "Active" : "None"}</p>
              </div>
            </div>
          </div>
        </section>
        
        {/* Proposal filtering tabs */}
        <div className="proposal-controls">
          <div className="proposal-tabs">
            <button
              onClick={() => setActiveTab("active")}
              className={`tab-btn ${activeTab === "active" ? 'active' : ''}`}
            >
              <FaList /> Active Proposals
            </button>
            
            <button
              onClick={() => setActiveTab("upcoming")}
              className={`tab-btn ${activeTab === "upcoming" ? 'active' : ''}`}
            >
              <FaClock /> Upcoming
            </button>
            
            <button
              onClick={() => setActiveTab("completed")}
              className={`tab-btn ${activeTab === "completed" ? 'active' : ''}`}
            >
              <FaRegCheckCircle /> Completed
            </button>
          </div>
        </div>
        
        {/* Proposals list */}
        <div className="proposals-grid">
          {filteredProposals.length === 0 ? (
            <div className="no-proposals">
              <h3>No proposals found</h3>
              <p>Create the first proposal for your organization</p>
              <button 
                onClick={() => setShowCreateModal(true)} 
                className="create-first-btn"
              >
                Create First Proposal
              </button>
            </div>
          ) : (
            filteredProposals.map(proposal => {
              const startDate = new Date(proposal.startTime);
              const endDate = new Date(proposal.endTime);
              const now = Date.now();
              const isActive = now >= proposal.startTime && now <= proposal.endTime && !proposal.isFinalized;
              const isCompleted = now > proposal.endTime || proposal.isFinalized;
              
              return (
                <div key={proposal.id} className="proposal-card">
                  <div className="proposal-header">
                    <div>
                      <h3>{proposal.title}</h3>
                      <div className={`proposal-status ${isActive ? 'active' : isCompleted ? 'completed' : 'upcoming'}`}>
                        {isActive ? "Voting Active" : isCompleted ? "Completed" : "Upcoming"}
                      </div>
                    </div>
                    {proposal.thresholdAlert && (
                      <div className="alert-badge">
                        <FaBell /> Threshold Alert
                      </div>
                    )}
                  </div>
                  
                  <div className="proposal-description">
                    {proposal.description}
                  </div>
                  
                  <div className="proposal-meta">
                    <div className="meta-item">
                      <FaClock /> Start: {startDate.toLocaleDateString()}
                    </div>
                    <div className="meta-item">
                      <FaClock /> End: {endDate.toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="fhe-results">
                    <div className="result-item">
                      <div className="result-label">Approve:</div>
                      <div className="result-value">
                        <FaLock /> {proposal.encryptedResults.approve.substr(0, 12)}...
                      </div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Reject:</div>
                      <div className="result-value">
                        <FaLock /> {proposal.encryptedResults.reject.substr(0, 12)}...
                      </div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Abstain:</div>
                      <div className="result-value">
                        <FaLock /> {proposal.encryptedResults.abstain.substr(0, 12)}...
                      </div>
                    </div>
                    <div className="result-item">
                      <div className="result-label">Total:</div>
                      <div className="result-value">
                        <FaLock /> {proposal.encryptedResults.total.substr(0, 12)}...
                      </div>
                    </div>
                  </div>
                  
                  <div className="proposal-actions">
                    {isActive && account && (
                      <button 
                        className="vote-btn"
                        onClick={() => {
                          setSelectedProposal(proposal);
                          setShowVoteModal(true);
                        }}
                      >
                        <FaVoteYea /> Cast Vote
                      </button>
                    )}
                    
                    {isCompleted && !proposal.isFinalized && account && (
                      <button 
                        className="finalize-btn"
                        onClick={() => finalizeProposal(proposal.id)}
                      >
                        <FaRegCheckCircle /> Finalize Results
                      </button>
                    )}
                    
                    {proposal.isFinalized && (
                      <button className="view-results-btn">
                        <FaChartPie /> View Results
                      </button>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
        
        {/* Audit Logs Section */}
        <section className="audit-section">
          <h2>Audit Logs with Zero-Knowledge Proofs</h2>
          <p className="section-description">
            All critical operations are recorded with cryptographic proofs to ensure integrity 
            while maintaining voter privacy through ZK technology.
          </p>
          
          <div className="audit-table">
            <div className="audit-header">
              <div className="header-item">Operation</div>
              <div className="header-item">Proposal</div>
              <div className="header-item">Timestamp</div>
              <div className="header-item">Proof Hash</div>
              <div className="header-item">Verification</div>
            </div>
            
            {auditLogs.map(log => {
              const logDate = new Date(log.timestamp);
              
              return (
                <div key={log.id} className="audit-row">
                  <div className="row-item">
                    <div className="operation-type">
                      {log.operation === "FINALIZE_RESULTS" && <FaRegCheckCircle />}
                      {log.operation === "THRESHOLD_ALERT" && <FaBell />}
                      {log.operation === "VOTE_CAST" && <FaVoteYea />}
                      {log.operation}
                    </div>
                  </div>
                  <div className="row-item">Proposal #{log.proposalId}</div>
                  <div className="row-item">{logDate.toLocaleString()}</div>
                  <div className="row-item hash-value">
                    <FaKey /> {log.operationHash.substr(0, 12)}...
                  </div>
                  <div className="row-item">
                    {log.verified ? (
                      <span className="verified-badge">
                        <FaCheck /> Verified
                      </span>
                    ) : (
                      <button 
                        className="verify-btn"
                        onClick={() => verifyAuditLog(log.id)}
                      >
                        Verify with ZK Proof
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      </div>
  
      {/* Modals */}
      {showCreateModal && (
        <ModalCreateProposal 
          onSubmit={createProposal} 
          onClose={() => setShowCreateModal(false)} 
          creating={creating}
        />
      )}
      
      {showVoteModal && selectedProposal && (
        <ModalVote 
          proposal={selectedProposal}
          onSubmit={castVote} 
          onClose={() => setShowVoteModal(false)} 
          creating={creating}
        />
      )}
      
      {walletSelectorOpen && (
        <WalletSelector
          isOpen={walletSelectorOpen}
          onWalletSelect={(wallet) => { onWalletSelect(wallet); setWalletSelectorOpen(false); }}
          onClose={() => setWalletSelectorOpen(false)}
        />
      )}
      
      {/* Transaction status modal */}
      {transactionStatus.visible && (
        <div className="transaction-modal">
          <div className="transaction-content">
            <div className={`transaction-icon ${transactionStatus.status}`}>
              {transactionStatus.status === "pending" && <FaSpinner />}
              {transactionStatus.status === "success" && <FaCheck />}
              {transactionStatus.status === "error" && <FaTimes />}
            </div>
            <div className="transaction-message">
              {transactionStatus.message}
            </div>
            {transactionStatus.status === "pending" && (
              <div className="transaction-progress">
                <div className="progress-bar"></div>
              </div>
            )}
          </div>
        </div>
      )}
  
      <footer className="app-footer">
        <p>Confidential Voting System &copy; {new Date().getFullYear()} - Powered by Zama FHE</p>
        <div className="footer-links">
          <a href="#">Privacy Policy</a>
          <a href="#">Governance Framework</a>
          <a href="#">FHE Technology</a>
          <a href="#">Compliance Docs</a>
        </div>
      </footer>
    </div>
  );
}

// Create proposal modal component
function ModalCreateProposal({ onSubmit, onClose, creating }: { 
  onSubmit: (title: string, description: string, duration: number) => void; 
  onClose: () => void; 
  creating: boolean;
}) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [duration, setDuration] = useState(7);

  const handleSubmit = () => {
    if (!title || !description || duration <= 0) {
      alert("Please fill all fields");
      return;
    }
    
    onSubmit(title, description, duration);
  };

  return (
    <div className="modal-overlay">
      <div className="create-modal">
        <div className="modal-header">
          <h2>Create New Proposal</h2>
          <button onClick={onClose} className="close-modal">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="fhe-notice-banner">
            <FaKey /> All votes will be encrypted with Zama FHE technology
          </div>
          
          <div className="form-group">
            <label>Proposal Title</label>
            <input 
              type="text"
              value={title} 
              onChange={e => setTitle(e.target.value)} 
              placeholder="Enter proposal title..." 
              className="form-input"
            />
          </div>
          
          <div className="form-group">
            <label>Proposal Description</label>
            <textarea 
              value={description} 
              onChange={e => setDescription(e.target.value)} 
              placeholder="Describe the proposal in detail..." 
              className="form-input"
              rows={5}
            />
          </div>
          
          <div className="form-group">
            <label>Voting Duration (days)</label>
            <input
              type="number"
              min="1"
              max="30"
              value={duration}
              onChange={e => setDuration(Number(e.target.value))}
              className="form-input"
            />
          </div>
          
          <div className="privacy-notice">
            <FaUserSecret /> Voter identities remain confidential
            <div className="fhe-tech">
              <FaKey /> Powered by Zama FHE encryption
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={creating}
            className="submit-btn"
          >
            {creating ? "Creating Proposal..." : "Create Proposal"}
          </button>
        </div>
      </div>
    </div>
  );
}

// Vote modal component
function ModalVote({ proposal, onSubmit, onClose, creating }: { 
  proposal: any;
  onSubmit: (proposalId: number, choice: string, weight: number) => void; 
  onClose: () => void; 
  creating: boolean;
}) {
  const [choice, setChoice] = useState("approve");
  const [weight, setWeight] = useState(100);
  const [showWeightInfo, setShowWeightInfo] = useState(false);

  const handleSubmit = () => {
    onSubmit(proposal.id, choice, weight);
  };

  return (
    <div className="modal-overlay">
      <div className="vote-modal">
        <div className="modal-header">
          <h2>Cast Your Vote</h2>
          <button onClick={onClose} className="close-modal">&times;</button>
        </div>
        
        <div className="modal-body">
          <div className="proposal-info">
            <h3>{proposal.title}</h3>
            <p>{proposal.description}</p>
          </div>
          
          <div className="fhe-notice-banner">
            <FaKey /> Your vote will be encrypted with Zama FHE before submission
          </div>
          
          <div className="form-group">
            <label>Your Vote</label>
            <div className="vote-options">
              <label className={`vote-option ${choice === "approve" ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="vote" 
                  value="approve" 
                  checked={choice === "approve"}
                  onChange={() => setChoice("approve")}
                />
                <div className="option-content">
                  <FaRegCheckCircle /> Approve
                </div>
              </label>
              
              <label className={`vote-option ${choice === "reject" ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="vote" 
                  value="reject" 
                  checked={choice === "reject"}
                  onChange={() => setChoice("reject")}
                />
                <div className="option-content">
                  <FaRegTimesCircle /> Reject
                </div>
              </label>
              
              <label className={`vote-option ${choice === "abstain" ? 'selected' : ''}`}>
                <input 
                  type="radio" 
                  name="vote" 
                  value="abstain" 
                  checked={choice === "abstain"}
                  onChange={() => setChoice("abstain")}
                />
                <div className="option-content">
                  <FaBalanceScale /> Abstain
                </div>
              </label>
            </div>
          </div>
          
          <div className="form-group">
            <label>
              Voting Weight 
              <button 
                className="info-btn"
                onClick={() => setShowWeightInfo(!showWeightInfo)}
              >
                ?
              </button>
            </label>
            <input
              type="number"
              min="1"
              value={weight}
              onChange={e => setWeight(Number(e.target.value))}
              className="form-input"
            />
            
            {showWeightInfo && (
              <div className="info-box">
                Voting weight represents your stake in this decision. 
                For corporate governance, this is typically based on share ownership.
              </div>
            )}
          </div>
          
          <div className="privacy-notice">
            <FaUserSecret /> Your individual vote will remain confidential
            <div className="fhe-tech">
              <FaKey /> Encrypted with Zama FHE technology
            </div>
          </div>
        </div>
        
        <div className="modal-footer">
          <button 
            onClick={onClose}
            className="cancel-btn"
          >
            Cancel
          </button>
          <button 
            onClick={handleSubmit} 
            disabled={creating}
            className="submit-btn"
          >
            {creating ? "Encrypting & Submitting..." : "Submit Vote"}
          </button>
        </div>
      </div>
    </div>
  );
}