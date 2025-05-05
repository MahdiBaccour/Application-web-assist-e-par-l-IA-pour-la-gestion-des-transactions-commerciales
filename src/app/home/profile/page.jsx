import PageHeader from '@/components/PageHeader';
import Profile from '@/components/profile/Profile.jsx';

export default function ProfilePage() {
  return (
    <>
      <PageHeader title="Profile" subtitle="Gérez vos paramétres ici." />
      <div className="card bg-base-100 shadow-xl mt-8">
        <div className="card-body">
          <h2 className="card-title">profile</h2>
          <Profile />
        </div>
      </div>
    </>
  );
}