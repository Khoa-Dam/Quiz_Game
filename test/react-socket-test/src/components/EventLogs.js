import React from 'react';

const EventLogs = ({ logs, clearLogs }) => {
  return (
    <div className="section">
      <h3>📜 Event Logs</h3>
      <button onClick={clearLogs}>Clear Logs</button>
      <div className="log">
        {logs.map((log, index) => (
          <div key={index} className={`log-entry log-${log.type}`}>
            [{log.timestamp}] {log.message}
          </div>
        ))}
      </div>
    </div>
  );
};

export default EventLogs;