import {
  FeedResponse,
  Work,
  Reference,
  WantRequest,
  Review,
  Notification,
  FunnelAnalyticsResponse,
  AcceptanceTestResult,
  User,
  School,
  Course,
  Enrollment,
  Certificate,
  SchoolPost,
  SchoolGraduateView,
  AuditLog,
  ClientHistoryItem,
  WorkConsentRequest,
  WorkConsentPermissions,
} from '../types/domain';

class ApiClient {
  private activeUserId: string = 'usr_anna';

  setActiveUserId(id: string) {
    this.activeUserId = id;
  }

  getActiveUserId(): string {
    return this.activeUserId;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'x-user-id': this.activeUserId,
      ...(options.headers as Record<string, string>),
    };

    const res = await fetch(`/api/v1${endpoint}`, {
      ...options,
      headers,
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(errData.error || `HTTP ${res.status}: ${res.statusText}`);
    }

    return res.json();
  }

  // --- Auth / Session ---
  async getMe(): Promise<{
    user: User;
    owned_schools?: School[];
    places?: any[];
    certificates?: Certificate[];
    client_history_count?: number;
    active_wants_count?: number;
    available_users: { id: string; name: string; avatar: string; profession?: string }[];
  }> {
    return this.request('/auth/me');
  }

  async switchUser(userId: string): Promise<{ success: boolean; current_user: User }> {
    const res = await this.request<{ success: boolean; current_user: User }>('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ user_id: userId }),
    });
    if (res.current_user) {
      this.activeUserId = res.current_user.id;
    }
    return res;
  }

  // Backward compatibility alias for switchRole
  async switchRole(role?: any, userId?: string): Promise<{ success: boolean; current_user: User }> {
    const targetUserId = userId || (role === 'master' ? 'usr_alexei' : 'usr_anna');
    return this.switchUser(targetUserId);
  }

  // --- Feed ---
  async getFeed(
    cursor?: string,
    category?: string,
    limit?: number,
    offset?: number
  ): Promise<FeedResponse> {
    const params = new URLSearchParams();
    if (cursor) params.append('cursor', cursor);
    if (category) params.append('category', category);
    if (limit !== undefined) params.append('limit', limit.toString());
    if (offset !== undefined) params.append('offset', offset.toString());
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/feed${qs}`);
  }

  async getMarketplaceWorks(
    category?: string,
    onlyPortfolio?: boolean
  ): Promise<{
    items: {
      work: Work;
      reference?: Reference;
      author: User;
    }[];
    total_count: number;
  }> {
    const params = new URLSearchParams();
    if (category && category !== 'Все') params.append('category', category);
    if (onlyPortfolio) params.append('only_portfolio', 'true');
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/marketplace/works${qs}`);
  }

  // --- References ---
  async getReferences(): Promise<Reference[]> {
    return this.request('/references');
  }

  async getReference(id: string): Promise<{ reference: Reference; works: Work[] }> {
    return this.request(`/references/${id}`);
  }

  async createReference(data: {
    title: string;
    category: string;
    media: any[];
    tags?: string[];
    source_url?: string;
    is_private?: boolean;
  }): Promise<Reference> {
    return this.request('/references', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Works ---
  async getWork(id: string): Promise<{ work: Work; author: User; reference: Reference }> {
    return this.request(`/works/${id}`);
  }

  async createWork(data: Partial<Work>): Promise<Work> {
    return this.request('/works', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateWork(id: string, data: Partial<Work>): Promise<{ success: boolean; work: Work }> {
    return this.request(`/works/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async deleteWork(id: string): Promise<{ success: boolean; message: string }> {
    return this.request(`/works/${id}`, {
      method: 'DELETE',
    });
  }

  // --- Users & Unified Profile ---
  async getUser(id: string): Promise<{
    user: User;
    works: Work[];
    references: Reference[];
    reviews: Review[];
    certificates?: Certificate[];
    is_following: boolean;
    stats: {
      works_count: number;
      references_count: number;
      followers_count: number;
      reviews_count: number;
      rating_avg: string;
    };
  }> {
    return this.request(`/users/${id}`);
  }

  // Legacy alias for getMaster -> resolves to getUser
  async getMaster(id: string): Promise<any> {
    return this.request(`/users/${id}`);
  }

  async updateUserProfession(
    id: string,
    data: {
      profession: string;
      title?: string;
      city?: string;
      specializations?: string[];
      booking_url?: string;
      place_name?: string;
      address?: string;
    }
  ): Promise<{ success: boolean; user: User; professional: any }> {
    return this.request(`/users/${id}/profession`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateUserPlace(
    id: string,
    data: {
      place_name: string;
      city: string;
      address?: string;
      booking_url?: string;
      period_label?: string;
    }
  ): Promise<{ success: boolean; message: string; place: any }> {
    return this.request(`/users/${id}/place`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateMasterPlace(id: string, data: any): Promise<any> {
    return this.updateUserPlace(id, data);
  }

  async updateUserBooking(
    id: string,
    data: { type: string; url: string; label: string }
  ): Promise<{ success: boolean; message: string }> {
    return this.request(`/users/${id}/booking`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async updateMasterBooking(id: string, data: any): Promise<any> {
    return this.updateUserBooking(id, data);
  }

  async followUser(
    id: string
  ): Promise<{ success: boolean; following: boolean; followers_count: number }> {
    return this.request(`/users/${id}/follow`, { method: 'POST' });
  }

  async followMaster(id: string) {
    return this.followUser(id);
  }

  async unfollowUser(
    id: string
  ): Promise<{ success: boolean; following: boolean; followers_count: number }> {
    return this.request(`/users/${id}/follow`, { method: 'DELETE' });
  }

  async unfollowMaster(id: string) {
    return this.unfollowUser(id);
  }

  // --- «ХОЧУ» (Want) ---
  async sendWant(data: {
    work_id: string;
    client_contact?: string;
    client_note?: string;
  }): Promise<{
    success: boolean;
    is_duplicate: boolean;
    want_request: WantRequest;
    booking: { type: string; url: string; label: string };
    message: string;
  }> {
    return this.request('/want', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getWants(): Promise<WantRequest[]> {
    return this.request('/wants');
  }

  async updateWantStatus(
    id: string,
    status: 'created' | 'seen' | 'completed' | 'cancelled'
  ): Promise<{ success: boolean; want: WantRequest }> {
    return this.request(`/wants/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  }

  // --- Reviews ---
  async createReview(data: {
    want_request_id: string;
    rating: number;
    text: string;
  }): Promise<Review> {
    return this.request('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  // --- Search ---
  async search(
    q: string,
    type: string = 'all'
  ): Promise<{ users: User[]; works: Work[]; references: Reference[] }> {
    const params = new URLSearchParams({ q, type });
    return this.request(`/search?${params.toString()}`);
  }

  // --- Notifications ---
  async getNotifications(): Promise<Notification[]> {
    return this.request('/notifications');
  }

  async markNotificationRead(id: string): Promise<{ success: boolean }> {
    return this.request(`/notifications/${id}/read`, { method: 'PATCH' });
  }

  // --- Schools & Education ---
  async getSchools(category?: string, city?: string): Promise<School[]> {
    const params = new URLSearchParams();
    if (category) params.append('category', category);
    if (city) params.append('city', city);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return this.request(`/schools${qs}`);
  }

  async getSchool(id: string): Promise<{
    school: School;
    courses: Course[];
    posts: SchoolPost[];
    stats: {
      graduates_count: number;
      courses_count: number;
      instructors_count: number;
    };
  }> {
    return this.request(`/schools/${id}`);
  }

  async createSchool(data: Partial<School>): Promise<School> {
    return this.request('/schools', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async updateSchool(
    id: string,
    data: Partial<School>
  ): Promise<{ success: boolean; school: School }> {
    return this.request(`/schools/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  }

  async getSchoolGraduates(id: string): Promise<SchoolGraduateView[]> {
    return this.request(`/schools/${id}/graduates`);
  }

  async getSchoolCourses(id: string): Promise<Course[]> {
    return this.request(`/schools/${id}/courses`);
  }

  async createSchoolCourse(id: string, data: Partial<Course>): Promise<Course> {
    return this.request(`/schools/${id}/courses`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getSchoolPosts(id: string): Promise<SchoolPost[]> {
    return this.request(`/schools/${id}/posts`);
  }

  async createSchoolPost(id: string, data: Partial<SchoolPost>): Promise<SchoolPost> {
    return this.request(`/schools/${id}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async enrollStudent(
    schoolId: string,
    userId: string,
    courseId: string
  ): Promise<Enrollment> {
    return this.request(`/schools/${schoolId}/enrollments`, {
      method: 'POST',
      body: JSON.stringify({ user_id: userId, course_id: courseId }),
    });
  }

  async verifyEnrollment(
    schoolId: string,
    enrollmentId: string
  ): Promise<{ success: boolean; certificate: Certificate; enrollment: Enrollment }> {
    return this.request(`/schools/${schoolId}/enrollments/${enrollmentId}/verify`, {
      method: 'PATCH',
    });
  }

  async verifyCertificate(token: string): Promise<{
    valid: boolean;
    status: string;
    certificate: Certificate;
    school: {
      id: string;
      name: string;
      logo: string;
      city: string;
      address: string;
      graduates_count: number;
    } | null;
    graduate: {
      user_id?: string;
      name: string;
      avatar: string;
      profession?: string;
    };
    tamper_proof_checksum: string;
    error?: string;
  }> {
    return this.request(`/certificates/verify/${encodeURIComponent(token)}`);
  }

  async getAuditLogs(): Promise<AuditLog[]> {
    return this.request('/audit-logs');
  }

  // --- Analytics ---
  async getFunnelAnalytics(): Promise<FunnelAnalyticsResponse> {
    return this.request('/analytics/funnel');
  }

  // --- Acceptance Tests Runner ---
  async runAcceptanceTests(): Promise<{
    all_passed: boolean;
    total_tests: number;
    passed_tests: number;
    results: AcceptanceTestResult[];
  }> {
    return this.request('/test-acceptance', { method: 'POST' });
  }

  // --- Client History & Repeat ---
  async getClientHistory(userId?: string): Promise<ClientHistoryItem[]> {
    const qs = userId ? `?user_id=${encodeURIComponent(userId)}` : '';
    return this.request(`/client-history${qs}`);
  }

  async createClientHistory(data: {
    client_user_id?: string;
    client_id?: string;
    work_id?: string;
    title?: string;
    photo_url?: string;
    reference_id?: string;
    price?: number;
    duration?: number;
    performed_at?: string;
    note?: string;
    save_to_history?: boolean;
    publish_photo?: boolean;
    show_client_name?: boolean;
  }): Promise<{
    success: boolean;
    work: Work;
    history_item: ClientHistoryItem | null;
    consent_request: WorkConsentRequest | null;
    message: string;
  }> {
    return this.request('/client-history', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async repeatHistory(historyId: string): Promise<{
    success: boolean;
    history_item: ClientHistoryItem;
    provider: User;
    booking_destination: any;
    repeat_message: string;
    action_url: string;
  }> {
    return this.request(`/history/${historyId}/repeat`, {
      method: 'POST',
    });
  }

  // --- Work Publication Consent ---
  async getConsentRequests(): Promise<WorkConsentRequest[]> {
    return this.request('/consent-requests');
  }

  async requestWorkConsent(
    workId: string,
    data: { client_user_id?: string; client_id?: string; show_client_name?: boolean }
  ): Promise<{ success: boolean; consent_request: WorkConsentRequest }> {
    return this.request(`/works/${workId}/consent-request`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async respondConsentRequest(
    consentId: string,
    action: 'grant' | 'reject',
    permissions?: Partial<WorkConsentPermissions>
  ): Promise<{
    success: boolean;
    status: 'granted' | 'rejected';
    consent: WorkConsentRequest;
    work?: Work;
    message: string;
  }> {
    return this.request(`/consent-requests/${consentId}`, {
      method: 'PATCH',
      body: JSON.stringify({ action, permissions }),
    });
  }
}

export const api = new ApiClient();
