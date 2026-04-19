import React, { useState } from 'react';
import { User, Case, CaseType, Priority } from '../../types';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { ArrowLeft, Upload, FileText, AlertCircle } from 'lucide-react';
import { Alert, AlertDescription } from '../ui/alert';
import { mockDepartments } from '../../lib/mockData';

interface SubmitGrievanceProps {
  user: User;
  onBack: () => void;
  onSubmit: (newCase: Case) => void;
}

export function SubmitGrievance({ user, onBack, onSubmit }: SubmitGrievanceProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '' as CaseType,
    priority: 'MEDIUM' as Priority,
    department: '',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [successCaseNumber, setSuccessCaseNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const apiBaseUrl = import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.type) {
      setError('Please select a case type');
      return;
    }

    if (!formData.department) {
      setError('Please select a department');
      return;
    }

    try {
      setIsSubmitting(true);

      const payload = new FormData();
      payload.append('title', formData.title);
      payload.append('description', formData.description);
      payload.append('case_type', formData.type);
      payload.append('priority', formData.priority);
      payload.append('department', formData.department);
      payload.append('citizen_id', user.id);
      payload.append('citizen_name', user.name);
      payload.append('citizen_email', user.email);

      attachments.forEach((file) => {
        payload.append('attachments', file);
      });

      const response = await fetch(`${apiBaseUrl}/api/complaints/`, {
        method: 'POST',
        body: payload,
      });

      if (!response.ok) {
        let detail = 'Failed to submit grievance. Please try again.';
        try {
          const errorData = await response.json();
          if (typeof errorData?.detail === 'string') {
            detail = errorData.detail;
          }
        } catch {
          // ignore parsing errors
        }
        throw new Error(detail);
      }

      const created = await response.json();

      const newCase: Case = {
        id: String(created.id),
        caseNumber: created.case_number,
        title: created.title,
        description: created.description,
        type: created.case_type,
        status: created.status,
        priority: created.priority,
        citizenId: created.citizen_id,
        citizenName: created.citizen_name,
        citizenEmail: created.citizen_email,
        department: created.department,
        slaDeadline: new Date(created.sla_deadline),
        createdAt: new Date(created.created_at),
        updatedAt: new Date(created.updated_at),
        attachments: (created.attachment_files || []).map((file: { url: string }) => file.url),
        escalationLevel: 0,
      };

      setSuccessCaseNumber(created.case_number || '');
      setSuccess(true);
      setTimeout(() => {
        onSubmit(newCase);
      }, 2000);
    } catch (submitError) {
      const message = submitError instanceof Error ? submitError.message : 'Submission failed.';
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen app-shell flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl">
          <CardContent className="py-12 text-center">
            <div className="bg-green-100 rounded-full p-4 w-16 h-16 mx-auto mb-4 flex items-center justify-center">
              <FileText className="h-8 w-8 text-green-600" />
            </div>
            <h2 className="text-gray-900 mb-2">Grievance Submitted Successfully!</h2>
            <p className="text-gray-600 mb-6">
              Your case has been registered and will be assigned to an officer shortly.
            </p>
            <div className="bg-gray-50 p-4 rounded-lg border mb-6">
              <p className="text-sm text-gray-600">Case Number</p>
              <p className="text-lg text-gray-900 mt-1">
                {successCaseNumber || 'Will be generated automatically'}
              </p>
            </div>
            <Button onClick={onBack}>Return to Dashboard</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-shell">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <Button
          variant="ghost"
          onClick={onBack}
          className="mb-4 transition-colors back-dashboard-btn"
        >
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Dashboard
        </Button>

        {/* Official Header */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-4 border-l-4 border-l-[#FF9933]">
          <div className="flex items-center gap-3">
            <img 
              src="/triseva-logo.jpeg"
              className="h-12 w-12 object-contain"
            />
            <div>
              <h2 className="text-lg text-[#000080]">Submit New Grievance</h2>
              <p className="text-sm text-gray-600">Government of India</p>
            </div>
          </div>
        </div>

        <Card className="border-l-4 border-l-[#138808] shadow-lg">
          <CardHeader className="bg-gradient-to-r from-green-50 to-white">
            <CardTitle className="text-[#000080]">Grievance Details</CardTitle>
            <CardDescription>
              Fill in the details below. Your submission will be tracked with complete transparency.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              {/* Case Type Selection */}
              <div className="space-y-3">
                <Label>Case Type *</Label>
                <RadioGroup
                  value={formData.type}
                  onValueChange={(value: string) => setFormData({ ...formData, type: value as CaseType })}
                >
                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer caseTypeOption">
                    <RadioGroupItem value="ADMINISTRATIVE" id="admin" />
                    <div className="flex-1">
                      <Label htmlFor="admin" className="cursor-pointer">
                        Administrative Grievance
                      </Label>
                      <p className="text-sm text-gray-600">
                        Infrastructure, public services, municipal issues
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer caseTypeOption">
                    <RadioGroupItem value="JUDICIAL" id="judicial" />
                    <div className="flex-1">
                      <Label htmlFor="judicial" className="cursor-pointer">
                        Judicial Appeal
                      </Label>
                      <p className="text-sm text-gray-600">
                        Legal matters, appeals, court-related issues
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2 p-4 border rounded-lg cursor-pointer caseTypeOption">
                    <RadioGroupItem value="LEGISLATIVE" id="legislative" />
                    <div className="flex-1">
                      <Label htmlFor="legislative" className="cursor-pointer">
                        Legislative Submission
                      </Label>
                      <p className="text-sm text-gray-600">
                        Policy feedback, public consultations, legislative matters
                      </p>
                    </div>
                  </div>
                </RadioGroup>
              </div>

              {/* Department Selection */}
              <div className="space-y-2">
                <Label htmlFor="department">Department *</Label>
                <Select value={formData.department} onValueChange={(value: string) => setFormData({ ...formData, department: value })}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {mockDepartments.map((dept) => (
                      <SelectItem key={dept.id} value={dept.name}>
                        {dept.name} ({dept.code})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Priority */}
              <div className="space-y-2">
                <Label htmlFor="priority">Priority *</Label>
                <Select 
                  value={formData.priority} 
                  onValueChange={(value: string) => setFormData({ ...formData, priority: value as Priority })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="LOW">Low - General feedback (30 days)</SelectItem>
                    <SelectItem value="MEDIUM">Medium - Standard issue (15 days)</SelectItem>
                    <SelectItem value="HIGH">High - Important matter (7 days)</SelectItem>
                    <SelectItem value="URGENT">Urgent - Critical issue (3 days)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Title */}
              <div className="space-y-2">
                <Label htmlFor="title">Title *</Label>
                <Input
                  id="title"
                  placeholder="Brief description of your grievance"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              {/* Description */}
              <div className="space-y-2">
                <Label htmlFor="description">Detailed Description *</Label>
                <Textarea
                  id="description"
                  placeholder="Provide complete details about your grievance, including relevant dates, locations, and any previous actions taken..."
                  rows={8}
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Attachments */}
              <div className="space-y-2">
                <Label>Attachments (Optional)</Label>
                <div className="border-2 border-dashed rounded-lg p-6 text-center">
                  <Upload className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-sm text-gray-600">
                    Drag and drop files here, or click to browse
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    PDF, Images, Documents (Max 10MB each)
                  </p>
                  <Input
                    type="file"
                    multiple
                    accept=".pdf,.png,.jpg,.jpeg,.doc,.docx"
                    className="mt-4"
                    onChange={(event) => {
                      const files = event.target.files ? Array.from(event.target.files) : [];
                      setAttachments(files);
                    }}
                  />
                  {attachments.length > 0 && (
                    <p className="text-xs text-gray-600 mt-2">
                      {attachments.length} file(s) selected
                    </p>
                  )}
                </div>
              </div>

              {/* Submit Button */}
              <div className="flex items-center justify-center gap-4">
                <Button type="button" variant="outline" size="sm" onClick={onBack}>
                  Cancel
                </Button>
                <Button type="submit" size="sm" disabled={isSubmitting}>
                  {isSubmitting ? 'Submitting...' : 'Submit Grievance'}
                </Button>
              </div>

              {/* Information */}
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <p className="text-sm text-blue-900">
                  <strong>Note:</strong> Once submitted, you can track your case progress in real-time. 
                  SLA-based automatic escalation ensures your case receives timely attention. 
                  All actions are logged in an audit trail for complete transparency.
                </p>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
