import React, { useState } from 'react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Button } from '../ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { MessageCircleQuestion } from 'lucide-react';

interface FaqDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

function generateResponse(userInput: string): string {
  const normalizedInput = userInput.toLowerCase();

  if (normalizedInput.includes('water')) {
    return (
      'File an online complaint on your municipal water supply portal with address and ' +
      'connection details, then track status digitally. If unresolved within timelines, ' +
      'escalate through the state public grievance portal or submit an RTI online. ' +
      'For urgent health risk due to contaminated water, contact the national health ' +
      'helpline 1075 and local municipal emergency control room for immediate intervention.'
    );
  }

  if (normalizedInput.includes('road') || normalizedInput.includes('pothole')) {
    return (
      'Submit a complaint on the municipal or public works department online portal with ' +
      'photos and exact location, then monitor progress using the tracking number. ' +
      'Escalate delays through the state grievance system or RTI portal. If potholes ' +
      'cause accidents or danger, inform local emergency services via helpline 112 to ' +
      'ensure rapid safety response and administrative accountability.'
    );
  }

  if (normalizedInput.includes('electricity') || normalizedInput.includes('power')) {
    return (
      'Register an outage or billing complaint on the state electricity distribution ' +
      'company website or mobile app using your consumer number and track restoration ' +
      'status online. Escalate unresolved issues to the electricity regulatory grievance ' +
      'forum or file RTI digitally. During dangerous outages or electrical hazards, ' +
      'contact emergency helpline 112 for immediate protective response and safety support.'
    );
  }

  if (normalizedInput.includes('corruption') || normalizedInput.includes('bribe')) {
    return (
      'Report corruption through the state vigilance or anti-corruption bureau online ' +
      'complaint portal with evidence and receive digital acknowledgment for tracking. ' +
      'If no action occurs, submit RTI online or approach judicial authorities through ' +
      'e-filing systems. Citizens may also call the national anti-corruption helpline ' +
      '1064 where available to ensure transparent investigation and institutional accountability.'
    );
  }

  if (normalizedInput.includes('fire')) {
    return (
      'Immediately call the national fire emergency helpline 101 for rapid response, then ' +
      'submit an online incident report on the municipal or disaster management portal ' +
      'with damage details for relief processing. Track assistance digitally and escalate ' +
      'delays through district grievance systems or RTI filing. Continuous follow-up ' +
      'ensures timely rescue support, compensation assessment, and administrative accountability.'
    );
  }

  if (normalizedInput.includes('police') || normalizedInput.includes('fir')) {
    return (
      'Use the state police online portal to register an e-FIR with evidence and download ' +
      'the acknowledgment for records. If registration is refused, complain digitally to ' +
      'senior police authorities or approach the magistrate via e-courts services. ' +
      'For immediate danger or crime in progress, dial national emergency helpline 112 ' +
      'to secure urgent police protection and lawful intervention.'
    );
  }

  if (normalizedInput.includes('court') || normalizedInput.includes('legal') || normalizedInput.includes('case')) {
    return (
      'Access e-courts online services to check case status, file petitions electronically, ' +
      'and download certified orders using required documents and fees. Administrative ' +
      'delay may be challenged through online court grievance systems or RTI filing ' +
      'for transparency. For urgent legal aid assistance, citizens can contact the ' +
      'national legal services helpline 1516 to obtain timely guidance and support.'
    );
  }

  return (
    'Submit your grievance on the appropriate government online public grievance portal ' +
    'with complete details and track progress using the reference number. Escalate ' +
    'unresolved matters to higher authorities or file RTI digitally for accountability. ' +
    'Where safety or emergency risk exists, citizens should contact national helpline ' +
    '112 to secure immediate assistance while administrative resolution proceeds lawfully.'
  );
}

const sampleQuestions = [
  'There is a huge pothole on my road.',
  'How do I report corruption?',
  'My area has no electricity since yesterday.',
  'I need to file an FIR.'
];

export function FaqDialog({ open, onOpenChange }: FaqDialogProps) {
  const [userInput, setUserInput] = useState('');
  const [response, setResponse] = useState('');

  const handleAsk = () => {
    if (!userInput.trim()) return;
    setResponse(generateResponse(userInput));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[96vw] sm:w-[94vw] !max-w-[1240px] sm:!max-w-[1240px] min-h-[72vh] max-h-[94vh] overflow-y-auto !opacity-100 border !border-sky-300 shadow-[0_30px_80px_rgba(15,23,42,0.25)]"
        style={{
          background: 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 45%, #93c5fd 100%)',
          opacity: 1,
        }}
      >
        <DialogHeader className="space-y-2 pb-3 border-b border-[#000080]/10">
          <DialogTitle className="flex items-center gap-2 text-[#000080] font-display">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white shadow-sm border border-[#000080]/10">
              <MessageCircleQuestion className="h-5 w-5" />
            </span>
            TriSeva FAQs
          </DialogTitle>
          <DialogDescription className="text-base text-gray-800">
            Ask about civic issues like water, roads, electricity, corruption, fire, police, or legal matters.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 mt-4">
          <div className="flex flex-col gap-3 rounded-xl border border-[#000080]/15 bg-white p-4 shadow-sm">
            <div className="flex flex-col sm:flex-row gap-3">
              <Input
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Type your civic issue..."
                className="text-base text-gray-900"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAsk();
                  }
                }}
              />
              <Button onClick={handleAsk} className="shimmer-btn">Ask</Button>
            </div>
            <p className="text-base text-gray-800">Quick examples:</p>
            <div className="flex flex-wrap gap-2">
              {sampleQuestions.map((question) => (
                <Button
                  key={question}
                  variant="outline"
                  size="sm"
                  className="rounded-full border-[#000080]/20 bg-[#f2f9ff] text-gray-900 hover:bg-[#d6ecff] hover:border-[#000080]/40"
                  onClick={() => {
                    setUserInput(question);
                    setResponse(generateResponse(question));
                  }}
                >
                  {question}
                </Button>
              ))}
            </div>
          </div>

          {response && (
            <Card className="border-l-4 border-l-[#000080] bg-white shadow-md">
              <CardHeader>
                <CardTitle className="text-lg text-[#000080]">Recommended Action</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-base text-gray-900 leading-7">{response}</p>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}