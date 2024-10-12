import React, { useState, useEffect, useRef } from 'react';

const FullScreenExam = () => {
  const [examTimer, setExamTimer] = useState(3600); // Exam duration in seconds (1 hour)
  const [violationCount, setViolationCount] = useState(0);
  const [isExamRunning, setIsExamRunning] = useState(false);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [violationTimer, setViolationTimer] = useState(10); // Violation grace period (10 seconds)
  const [showViolationWarning, setShowViolationWarning] = useState(false);
  const violationIntervalId=null; // Store the violation timer interval ID
  const [violationAcknowledged, setViolationAcknowledged] = useState(false); // Flag to track if violation has been acknowledged
  const myRef = useRef(null);
  // Start the countdown timer for the exam
  useEffect(() => {
    if (isExamRunning && examTimer > 0) {
      const intervalId = setInterval(() => {
        setExamTimer((prevTimer) => prevTimer - 1);
      }, 1000);

      return () => clearInterval(intervalId);
    }

    if (examTimer === 0) {
      terminateExam('Time is up! Exam has ended.');
    }
  }, [isExamRunning, examTimer]);

  // Handle fullscreen and visibility changes
  useEffect(() => {
    const handleFullScreenChange = () => {
      if (isExamRunning) {
        if (!document.fullscreenElement) {
          setIsFullScreen(false);
          handleViolation(); // Handle violation if exiting full-screen
        } else {
          setIsFullScreen(true);
          setShowViolationWarning(false); // Hide warning if they return to full-screen
          setViolationAcknowledged(false); // Reset violation acknowledgment when returning to full-screen
        }
      }
    };

    const handleVisibilityChange = () => {
      if (isExamRunning && document.visibilityState === 'hidden') {
        handleViolation(); // Count as violation if the tab is hidden
      }
    };

    if (isExamRunning) {
      document.addEventListener('fullscreenchange', handleFullScreenChange);
      document.addEventListener('visibilitychange', handleVisibilityChange);
    }

    return () => {
      document.removeEventListener('fullscreenchange', handleFullScreenChange);
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [isExamRunning]);

  const handleViolation = () => {
    if (violationCount < 1 && !violationAcknowledged) { // Trigger only if no prior violation acknowledged
      setViolationCount((prevCount) => prevCount + 1); // Increment violation count
      setShowViolationWarning(true); // Show warning
      setViolationAcknowledged(true); // Mark violation as acknowledged
      startViolationTimer(); // Start the violation timer only when there is a violation
    } 
  };
  useEffect(() => {
    if (violationCount > 1) {
      terminateExam("Exam terminated due to multiple violations.");
    }
  }, [violationCount]);
  const startViolationTimer = () => {
    setViolationTimer(10); // Reset violation timer to 10 seconds
    clearInterval(violationIntervalId); // Clear previous timer if any
         myRef.current = setInterval(() => {
      setViolationTimer((prevTimer) => {
        if (prevTimer <= 1) {
          
          terminateExam('Violation timer exceeded. Exam terminated.'); // Call terminate exam when timer ends
          clearInterval(myRef.current);
          return 0; // Reset timer
        }
        return prevTimer - 1; // Decrement the timer
      });
    }, 1000);

    //setViolationIntervalId(intervalId); // Store the interval ID
  };

  const startExam = () => {
    setExamTimer(3600); // Reset timer to 3600 seconds
    setViolationCount(0); // Reset violation count when exam starts
    setViolationAcknowledged(false); // Reset violation acknowledgment
    setIsExamRunning(true); // Start the exam
    enterFullScreen(); // Request fullscreen mode
  };

  const enterFullScreen = () => {
    document.documentElement.requestFullscreen().then(() => {
      clearInterval(myRef.current);
      setIsFullScreen(true);
    }).catch(() => {
      alert('Fullscreen is required to take the exam.');
    });
  };

  const exitFullScreen = () => {
    if (document.fullscreenElement) {
      document.exitFullscreen().then(() => {
        setIsFullScreen(false);
      }).catch((err) => {
        console.error('Error exiting fullscreen: ', err);
      });
    }
  };

  const terminateExam = (message) => {
    setIsExamRunning(false);
    clearInterval(violationIntervalId); // Clear the violation timer
    setShowViolationWarning(false); // Hide violation warning
    alert(message);
  };

  const submitExam = () => {
    terminateExam('Exam submitted successfully!');
  };

  return (
    <div>
      <h1>Full-Screen Exam Platform</h1>

      {!isExamRunning ? (
        <button onClick={startExam}>Start Exam</button>
      ) : (
        <div>
          <h2>Time Remaining: {`${Math.floor(examTimer / 60)}:${String(examTimer % 60).padStart(2, '0')}`}</h2>
          <button onClick={submitExam}>Submit Exam</button>
          <h3>Violation Count: {violationCount}</h3>

          {showViolationWarning && (
            <div className="violation-warning">
              <h4>Violation Warning! Return to full-screen mode within {violationTimer} seconds.</h4>
            </div>
          )}

          {!isFullScreen && <h4>Please return to full-screen mode immediately.</h4>}

          {/* Fullscreen toggle buttons */}
          {isFullScreen ? (
            <button onClick={exitFullScreen}>Exit Full-Screen</button>
          ) : (
            <button onClick={enterFullScreen}>Enter Full-Screen</button>
          )}
        </div>
      )}
    </div>
  );
};

export default FullScreenExam;
