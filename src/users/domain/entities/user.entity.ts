export type UserProps = {
  name: string;
  email: string;
  password: string;
  createdAt?: Date;
};

export class UserEntity {
  constructor(public readonly props: UserProps) {
    this.props.createdAt = this.props.createdAt ?? new Date();
  }

  getName() {
    return this.props.name;
  }

  getEmail() {
    return this.props.email;
  }

  getPassword() {
    return this.props.password;
  }

  getCreatedAt() {
    return this.props.createdAt;
  }
}
